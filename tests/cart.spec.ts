import { test, expect } from '../src/fixtures/test';
import { formatPrice, products, threeItems } from '../src/data/products';

const { onesie, bikeLight, boltTShirt } = products;

test.describe('Cart', () => {
  test('TC06 adding single and multiple items updates badge and buttons', { tag: '@smoke' }, async ({ loggedInAsStandard: inventory, header }) => {
    await expect(header.cartBadge).toBeHidden();

    await inventory.addToCart(onesie.slug);
    await expect(header.cartBadge).toHaveText('1');
    await expect(inventory.removeButton(onesie.slug)).toBeVisible();

    await inventory.addToCart(bikeLight.slug);
    await inventory.addToCart(boltTShirt.slug);
    await expect(header.cartBadge).toHaveText('3');
    for (const p of threeItems) await expect(inventory.removeButton(p.slug)).toBeVisible();
  });

  test('TC07 add two items and remove one from inventory page updates badge and cart', async ({ loggedInAsStandard: inventory, header, cartPage }) => {
    await inventory.addToCart(onesie.slug);
    await inventory.addToCart(bikeLight.slug);
    await expect(header.cartBadge).toHaveText('2');

    await inventory.removeFromCart(onesie.slug);
    await expect(header.cartBadge).toHaveText('1');
    await expect(inventory.addToCartButton(onesie.slug)).toBeVisible();

    await header.openCart();
    await expect(cartPage.itemNames).toHaveText([bikeLight.name]);
  });

  test('TC08 cart persists on page refresh', async ({ loggedInAsStandard: inventory, header }) => {
    for (const p of threeItems) await inventory.addToCart(p.slug);
    await expect(header.cartBadge).toHaveText('3');

    await inventory.reload();

    await expect(header.cartBadge).toHaveText('3');
    for (const p of threeItems) await expect(inventory.removeButton(p.slug)).toBeVisible();
  });

  test('TC09 cart shows quantity, name, description and price; Continue Shopping keeps items', async ({ page, loggedInAsStandard: inventory, header, cartPage }) => {
    for (const p of threeItems) await inventory.addToCart(p.slug);
    await header.openCart();

    await expect(cartPage.itemNames).toHaveText(threeItems.map((p) => p.name));
    await expect(cartPage.itemQuantities).toHaveText(threeItems.map(() => '1'));
    await expect(cartPage.itemPrices).toHaveText(threeItems.map(formatPrice));
    await expect(cartPage.itemDescriptions).toHaveCount(threeItems.length);
    for (let i = 0; i < threeItems.length; i++) await expect(cartPage.itemDescriptions.nth(i)).not.toBeEmpty();

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toHaveText('3');
  });

  test('TC10 removing an item in the cart updates list and badge', async ({ loggedInAsStandard: inventory, header, cartPage }) => {
    for (const p of threeItems) await inventory.addToCart(p.slug);
    await header.openCart();
    await expect(header.cartBadge).toHaveText('3');

    await cartPage.removeItem(boltTShirt.slug);

    await expect(cartPage.itemNames).toHaveText([onesie.name, bikeLight.name]);
    await expect(header.cartBadge).toHaveText('2');
  });
});

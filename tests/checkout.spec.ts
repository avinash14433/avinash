import { readFile } from 'fs/promises';
import { test, expect } from '../src/fixtures/test';
import type { Product } from '../src/data/products';
import { PRODUCT_COUNT, products } from '../src/data/products';
import { messages } from '../src/data/messages';
import { expectedOrder, missingFieldCases, validCustomer } from '../src/data/customers';
import type { InventoryPage } from '../src/pages/InventoryPage';
import type { HeaderComponent } from '../src/pages/components/HeaderComponent';
import type { CartPage } from '../src/pages/CartPage';
import { toCents } from '../src/utils/money';

/** Each test builds its own cart, so tests stay independent of each other. */
async function goToCheckout(inventory: InventoryPage, header: HeaderComponent, cart: CartPage, items: Product[]) {
  for (const p of items) await inventory.addToCart(p.slug);
  await header.openCart();
  await cart.checkout();
}

test.describe('Checkout', () => {
  test('TC11 Checkout opens step one and valid info opens step two', async ({
    page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage,
  }) => {
    await goToCheckout(inventory, header, cartPage, [products.onesie]);
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    await checkoutInfoPage.submit(validCustomer);

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  // TC13–TC15: one parameterized test, one generated test per missing field.
  for (const c of missingFieldCases) {
    test(`${c.id} checkout shows an error when ${c.field} is missing`, async ({
      page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage,
    }) => {
      await goToCheckout(inventory, header, cartPage, [products.onesie]);

      await checkoutInfoPage.submit(c.customer);

      await expect(checkoutInfoPage.error).toHaveText(c.error);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }

  test('TC17 Cancel on step one returns to the cart with items kept', async ({
    page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage,
  }) => {
    await goToCheckout(inventory, header, cartPage, [products.onesie]);

    await checkoutInfoPage.cancel();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.itemNames).toHaveText([products.onesie.name]);
  });

  test('TC18 overview lists only cart items with payment and shipping info', async ({
    loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage, checkoutOverviewPage,
  }) => {
    await goToCheckout(inventory, header, cartPage, expectedOrder.items);
    await checkoutInfoPage.submit(validCustomer);

    await expect(checkoutOverviewPage.itemNames).toHaveText(expectedOrder.items.map((p) => p.name));
    await expect(checkoutOverviewPage.paymentInfo).toHaveText(messages.paymentInfo);
    await expect(checkoutOverviewPage.shippingInfo).toHaveText(messages.shippingInfo);
  });

  test('TC17 Cancel on overview returns to inventory without placing the order', async ({
    page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await goToCheckout(inventory, header, cartPage, expectedOrder.items);
    await checkoutInfoPage.submit(validCustomer);
    await expect(checkoutOverviewPage.finishButton).toBeVisible();

    await checkoutOverviewPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toHaveText(String(expectedOrder.items.length));
    await expect(checkoutCompletePage.confirmationMessage).toBeHidden();
  });

  test('TC19 full checkout: total equals item total plus tax and cart is empty afterwards', { tag: '@smoke' }, async ({
    page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await goToCheckout(inventory, header, cartPage, expectedOrder.items);
    await checkoutInfoPage.submit(validCustomer);

    await expect(checkoutOverviewPage.itemPrices).toHaveCount(expectedOrder.items.length);
    const s = await checkoutOverviewPage.getSummary();
    const sumOfItems = s.itemPrices.reduce((acc, p) => acc + toCents(p), 0);

    // Rules that must always hold:
    expect(toCents(s.subtotal), 'item total = sum of item prices').toBe(sumOfItems);
    expect(toCents(s.total), 'total = item total + tax').toBe(toCents(s.subtotal) + toCents(s.tax));
    // Expected values for this basket (tax at the assumed 8%, A2):
    expect(toCents(s.subtotal), 'item total').toBe(toCents(expectedOrder.subtotal));
    expect.soft(toCents(s.tax), 'tax at 8%').toBe(toCents(expectedOrder.tax));
    expect.soft(toCents(s.total), 'grand total').toBe(toCents(expectedOrder.total));

    await checkoutOverviewPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.confirmationMessage).toHaveText(messages.orderComplete);
    await expect(header.cartBadge).toBeHidden();
    await header.openCart();
    await expect(cartPage.items).toHaveCount(0);
  });

  test('TC20 Back Home after an order shows inventory with an empty cart', async ({
    page, loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }) => {
    await goToCheckout(inventory, header, cartPage, expectedOrder.items);
    await checkoutInfoPage.submit(validCustomer);
    await checkoutOverviewPage.finish();
    await expect(checkoutCompletePage.confirmationMessage).toBeVisible();

    await checkoutCompletePage.backHome();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toBeHidden();
    await expect(inventory.allRemoveButtons).toHaveCount(0);
    await expect(inventory.allAddToCartButtons).toHaveCount(PRODUCT_COUNT);
  });

  test('TC21 Generate PDF order downloads a valid PDF', async ({
    loggedInAsStandard: inventory, header, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage,
  }, testInfo) => {
    await goToCheckout(inventory, header, cartPage, expectedOrder.items);
    await checkoutInfoPage.submit(validCustomer);
    await checkoutOverviewPage.finish();
    await expect(checkoutCompletePage.generatePdfButton).toBeVisible();

    const download = await checkoutCompletePage.generatePdf();

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    const filePath = await download.path();
    const bytes = await readFile(filePath);
    expect(bytes.length, 'PDF is not empty').toBeGreaterThan(0);
    expect(bytes.subarray(0, 5).toString(), 'file is a real PDF').toBe('%PDF-');
    // Attach the PDF to the HTML report so the content (items, $19.42 total, customer) can be reviewed.
    await testInfo.attach('order.pdf', { path: filePath, contentType: 'application/pdf' });
  });
});

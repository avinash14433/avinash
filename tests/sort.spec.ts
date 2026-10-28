import { test, expect } from '../src/fixtures/test';
import type { SortOption } from '../src/pages/InventoryPage';
import { PRODUCT_COUNT, products } from '../src/data/products';

type SortCase = { id: string; title: string; option: SortOption; direction: 1 | -1 };

const nameSorts: SortCase[] = [
  { id: 'TC03', title: 'sorts by name A to Z', option: 'az', direction: 1 },
  { id: 'TC03', title: 'sorts by name Z to A', option: 'za', direction: -1 },
];

const priceSorts: SortCase[] = [
  { id: 'TC04', title: 'sorts by price low to high', option: 'lohi', direction: 1 },
  { id: 'TC04', title: 'sorts by price high to low', option: 'hilo', direction: -1 },
];

test.describe('Sorting – checks the whole list, not just the first item', () => {
  for (const s of nameSorts) {
    test(`${s.id} ${s.title}`, async ({ loggedInAsStandard: inventory }) => {
      await expect(inventory.itemNames).toHaveCount(PRODUCT_COUNT);
      const expected = [...(await inventory.getNames())].sort((a, b) => s.direction * a.localeCompare(b));

      // A–Z is the default order, so switch away first to prove the option itself works.
      if (s.option === 'az') await inventory.sortBy('za');
      await inventory.sortBy(s.option);

      await expect(inventory.sortSelect).toHaveValue(s.option);
      await expect.poll(() => inventory.getNames()).toEqual(expected);
    });
  }

  for (const s of priceSorts) {
    test(`${s.id} ${s.title}`, { tag: '@smoke' }, async ({ loggedInAsStandard: inventory }) => {
      await expect(inventory.itemPrices).toHaveCount(PRODUCT_COUNT);
      const expected = [...(await inventory.getPrices())].sort((a, b) => s.direction * (a - b));

      await inventory.sortBy(s.option);

      await expect(inventory.sortSelect).toHaveValue(s.option);
      await expect.poll(() => inventory.getPrices()).toEqual(expected);
    });
  }

  test('TC05 sort order persists after adding items', async ({ loggedInAsStandard: inventory, header }) => {
    await expect(inventory.itemPrices).toHaveCount(PRODUCT_COUNT);
    const expected = [...(await inventory.getPrices())].sort((a, b) => a - b);
    await inventory.sortBy('lohi');
    await expect.poll(() => inventory.getPrices()).toEqual(expected);

    await inventory.addToCart(products.onesie.slug);
    await inventory.addToCart(products.bikeLight.slug);
    await expect(header.cartBadge).toHaveText('2');

    await expect(inventory.sortSelect).toHaveValue('lohi');
    await expect.poll(() => inventory.getPrices()).toEqual(expected);
  });
});

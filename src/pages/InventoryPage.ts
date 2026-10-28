import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';
import { parsePrice } from '../utils/money';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly allAddToCartButtons: Locator;
  readonly allRemoveButtons: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.allAddToCartButtons = page.locator('[data-test^="add-to-cart-"]');
    this.allRemoveButtons = page.locator('[data-test^="remove-"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.inventory);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  addToCartButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  removeButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async addToCart(slug: string): Promise<void> {
    await this.addToCartButton(slug).click();
  }

  async removeFromCart(slug: string): Promise<void> {
    await this.removeButton(slug).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getPrices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(parsePrice);
  }
}

import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemQuantities: Locator;
  readonly itemDescriptions: Locator;
  readonly itemPrices: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemQuantities = page.getByTestId('item-quantity');
    this.itemDescriptions = page.getByTestId('inventory-item-desc');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.cart);
  }

  removeButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async removeItem(slug: string): Promise<void> {
    await this.removeButton(slug).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}

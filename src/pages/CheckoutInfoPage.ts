import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';
import type { Customer } from '../data/customers';

export class CheckoutInfoPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.checkoutInfo);
  }

  async submit(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

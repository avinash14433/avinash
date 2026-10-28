import type { Download, Locator, Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly confirmationMessage: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(private readonly page: Page) {
    this.confirmationMessage = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
    // Matched by role and visible text; swap to getByTestId(...) once the data-test value is confirmed in DevTools.
    this.generatePdfButton = page.getByRole('button', { name: /generate pdf/i });
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  /** Clicks "Generate PDF order" and resolves with the downloaded file (event-based wait, no sleep). */
  async generatePdf(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.generatePdfButton.click();
    return downloadPromise;
  }
}

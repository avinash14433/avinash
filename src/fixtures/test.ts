import { test as base, expect } from '@playwright/test';
import { env, users } from '../config/env';
import { HeaderComponent } from '../pages/components/HeaderComponent';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

type Fixtures = {
  header: HeaderComponent;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Fresh browser context, logged in as the standard user, on the Products page. */
  loggedInAsStandard: InventoryPage;
};

export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  loggedInAsStandard: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.goto();
    await loginPage.login(users.standard, env.password);
    await expect(inventoryPage.title).toHaveText('Products');
    await use(inventoryPage);
  },
});

export { expect };

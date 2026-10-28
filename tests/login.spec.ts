import { test, expect } from '../src/fixtures/test';
import { env, users } from '../src/config/env';
import { messages } from '../src/data/messages';
import { PRODUCT_COUNT } from '../src/data/products';

test.describe('Login', () => {
  test('TC01 standard user logs in and sees products', { tag: '@smoke' }, async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard, env.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(PRODUCT_COUNT);
  });

  test('TC02 locked-out user sees locked-out error', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut, env.password);

    await expect(loginPage.error).toContainText(messages.lockedOut);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(inventoryPage.title).toBeHidden();
  });
});

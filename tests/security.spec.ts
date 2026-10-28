import { test, expect } from '../src/fixtures/test';
import { routes } from '../src/config/routes';
import { messages } from '../src/data/messages';

test.describe('Access control', () => {
  test('TC22 inventory page cannot be opened by URL after logout', { tag: '@smoke' }, async ({
    loggedInAsStandard: inventory, header, loginPage,
  }) => {
    await header.logout();
    await expect(loginPage.loginButton).toBeVisible();

    await inventory.goto();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.error).toContainText(messages.loginRequired(routes.inventory));
    await expect(inventory.title).toBeHidden();
  });
});

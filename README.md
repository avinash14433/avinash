# Sauce Demo – Shop and check out test suite

Manual and automated tests for the "shop and check out" use case on [Sauce Demo](https://www.saucedemo.com), built with **Playwright + TypeScript**.

| File | Contents |
|---|---|
| `docs/TEST_CASES.md` | A1: PO questions and assumptions, 25 manual test cases (login, sort, cart, checkout, security, usability, browser, accessibility), exploratory charter, strategy |
| `tests/` | A2: automated tests; each name starts with its manual case ID |
| `ANSWERS.md` | Section B answers |
| `AI_USAGE.md` | Where an AI assistant was used and what I changed |

## Setup

Requires Node.js 18+.

```bash
npm install
npx playwright install        # downloads Chromium, Firefox and WebKit
cp .env.example .env          # optional: override base URL or users
```

On Windows, the optional env copy is `copy .env.example .env`.

Config lives in `src/config/env.ts` and is read from environment variables, with the public Sauce Demo values as defaults. No URLs or credentials appear in test bodies.

## Run

| Command | What it runs |
|---|---|
| `npm test` | All tests on Chromium |
| `npm run test:smoke` | `@smoke` tests only (TC01, TC02, TC04, TC06, TC19, TC22) |
| `npm run test:all-browsers` | All tests on Chromium, Firefox, WebKit and Pixel 7 (TC24) |
| `npx playwright test -g TC04` | A single case by ID |
| `npm run report` | Opens the HTML report |

**Reports:** HTML in `playwright-report/`, JUnit XML in `results/junit.xml`. On failure, a screenshot, video and trace are saved in `test-results/` and attached to the HTML report.

## Design

```
src/
  config/      env.ts (base URL, users), routes.ts
  data/        products, customers, login cases, expected messages
  fixtures/    test.ts – page-object fixtures + loggedInAsStandard
  pages/       one Page Object per page; components/HeaderComponent.ts
  utils/       money.ts – price parsing, compare in cents
tests/         login, sort, cart, checkout, security specs
```

- **Page Object Model:** all locators live in `src/pages`. Locators use Sauce Demo's `data-test` attributes (`testIdAttribute: 'data-test'`), not CSS classes or text.
- **No fixed sleeps:** only web-first assertions (`toHaveText`, `toHaveCount`) and `expect.poll` for list order.
- **Independent tests:** each test gets a fresh browser context, logs in via a fixture and builds its own cart (the manual cases share a starting state but never depend on an earlier case). `fullyParallel: true` runs them in any order.
- **Parameterized tests:** TC03–TC04 (sorting) and TC13–TC15 (missing checkout fields) are generated from data arrays.
- **Money:** compared in whole cents to avoid floating-point errors. The hard checks are item total = sum of prices and total = item total + tax. The exact tax ($1.44) and total ($19.42) depend on the assumed 8% rate (A2), so they use `expect.soft`.
- **Sorting:** the expected order is calculated from the prices and names on the page, then compared with the whole displayed list.
- **PDF order (TC21):** waits for the `download` event, checks the file name ends in `.pdf` and the file starts with `%PDF-`, then attaches it to the HTML report.
- **CI:** `.github/workflows/playwright.yml` runs `npx playwright test` on every push and pull request, so all four projects run, and uploads the HTML report and JUnit results.

## Traceability: manual case → automated test

| Manual ID | Title | Automated test |
|---|---|---|
| TC01 | Standard user logs in | `login.spec.ts` › TC01 standard user logs in and sees products |
| TC02 | Locked-out user is blocked | `login.spec.ts` › TC02 locked-out user sees locked-out error |
| TC03 | Sort by name A→Z and Z→A | `sort.spec.ts` › TC03 sorts by name A to Z · TC03 sorts by name Z to A |
| TC04 | Sort by price low→high and high→low | `sort.spec.ts` › TC04 sorts by price low to high · TC04 sorts by price high to low |
| TC05 | Sort order persists after adding items | `sort.spec.ts` › TC05 sort order persists after adding items |
| TC06 | Add single and multiple items | `cart.spec.ts` › TC06 adding single and multiple items updates badge and buttons |
| TC07 | Add two, remove one from inventory page | `cart.spec.ts` › TC07 add two items and remove one from inventory page updates badge and cart |
| TC08 | Cart persists on refresh | `cart.spec.ts` › TC08 cart persists on page refresh |
| TC09 | Cart contents and Continue Shopping | `cart.spec.ts` › TC09 cart shows quantity, name, description and price; Continue Shopping keeps items |
| TC10 | Remove item from the cart page | `cart.spec.ts` › TC10 removing an item in the cart updates list and badge |
| TC11 | Go to checkout and enter valid info | `checkout.spec.ts` › TC11 Checkout opens step one and valid info opens step two |
| TC12 | Checkout with an empty cart | Manual only (expected behaviour unconfirmed, Q4) |
| TC13 | First name missing | `checkout.spec.ts` › TC13 checkout shows an error when first name is missing |
| TC14 | Last name missing | `checkout.spec.ts` › TC14 checkout shows an error when last name is missing |
| TC15 | Postal code missing | `checkout.spec.ts` › TC15 checkout shows an error when postal code is missing |
| TC16 | Invalid field input | Manual only (rules unconfirmed, Q3) |
| TC17 | Cancel at step one and at overview | `checkout.spec.ts` › TC17 Cancel on step one returns to the cart with items kept · TC17 Cancel on overview returns to inventory without placing the order |
| TC18 | Overview items, payment and shipping | `checkout.spec.ts` › TC18 overview lists only cart items with payment and shipping info |
| TC19 | Complete the order with correct totals | `checkout.spec.ts` › TC19 full checkout: total equals item total plus tax and cart is empty afterwards |
| TC20 | Back Home after order | `checkout.spec.ts` › TC20 Back Home after an order shows inventory with an empty cart |
| TC21 | Generate PDF order | `checkout.spec.ts` › TC21 Generate PDF order downloads a valid PDF (content checked manually from the attached PDF) |
| TC22 | Inventory page blocked after logout | `security.spec.ts` › TC22 inventory page cannot be opened by URL after logout |
| TC23 | Error messages are clear | Manual only (needs human judgement) |
| TC24 | Firefox, Safari and 375 px phone | All tests via `firefox`, `webkit` and `mobile-chrome` projects; layout check is manual |
| TC25 | Keyboard-only use | Manual only (axe-core scan planned) |

## Growing the suite to 200 tests

At 200 tests, the main costs are run time, flakiness and maintenance, so the structure has to scale before the test count does. I would keep one page object per page and move shared UI (header, menu, product card) into components so a locator change is fixed in one place. The UI login would be replaced by a fixture that sets the session directly (Sauce Demo keeps it in a `session-username` cookie; on a real product this would be an API login with `storageState`), which saves several seconds per test. Test data would come from builders rather than inline objects, and tests would be tagged `@smoke`, `@regression` and `@cross-browser`: smoke on every pull request, full regression nightly, sharded across CI workers (`--shard=1/4`). Flaky tests would be reported from Playwright's retry data and quarantined with an owner and a fix date rather than silently re-run. `eslint-plugin-playwright` would block `waitForTimeout` and raw selectors in test bodies. Finally, logic such as sorting and tax would move to API or unit tests where the client has them, keeping the UI suite focused on user journeys.

## Assumptions

See `docs/TEST_CASES.md` §1. The one that affects automation is A2 (8% tax, so the exact tax and total are soft checks).

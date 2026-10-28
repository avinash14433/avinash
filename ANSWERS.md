# Section B – Answers

## B1. Review of the AI-generated code

I read the page objects and specs against the live site and against the manual cases. The structure is sound: one page object per page, `data-test` locators, a login fixture, parameterized checks for TC13–TC15, and money compared in cents. These are the gaps I would send back.

1. **TC21 can pass on a useless PDF.** `CheckoutCompletePage` finds "Generate PDF order" by role and visible text, because that control has no `data-test`. The spec then checks the file name and the `%PDF-` header only. A blank or wrong PDF still passes. Assumption A6 (items, total, customer name and postal code) is not asserted.

2. **A wrong tax still places the order.** In TC19 the 8% tax and the $19.42 total are `expect.soft`, and they run before Finish. A soft failure does not stop the test, so Finish still runs and the failure shows up only at the end. The hard checks (item total equals the sum of prices, total equals item total plus tax) are the right ones. The assumed rate should be called out as an assumption, which the README does, and it should not be easy to miss in the report.

3. **Sort tests check order, not the catalog.** TC03 and TC04 sort the names and prices just read from the page, then compare that list with the page. A missing product or a wrong price still passes if the list is a sorted copy of itself. The count of 6 is the only catalog lock.

4. **The menu locator does not follow the `data-test` rule.** Logout clicks `getByRole('button', { name: 'Open Menu' })`. On the live page the `data-test` is `open-menu` on the icon. TC22 passed with the accessible name, so it works today and will break if that name changes.

5. **`problem_user` is unused.** The user is configured and the exploratory charter is about that account, but no spec logs in as them or listens for `pageerror`. Broken images, a sort that does nothing, and an Add to cart that does nothing would not fail this suite.

6. **The empty-cart rule is untested, and the site breaks it.** TC12 was left manual until Q4 was answered. I reproduced it (see B3). The suite stays green while checkout runs with no items.

## B2. How I checked the AI-generated tests

| Check | Result on 28 Oct 2026 |
|---|---|
| `npm test` (Chromium) | 23 passed in about 1 minute, 7 workers, `fullyParallel` |
| `npm run test:all-browsers` | Not run |
| Deliberately wrong assertion, to prove a failure saves a screenshot | Not run |
| Locators and messages against the live page | Cart, checkout step one, overview totals, and the PDF control checked in a browser. Locked-out and required-field strings are the ones in `src/data/messages.ts` and `missingFieldCases` |
| `waitForTimeout`, site URL, or password inside `tests/` | None. The public defaults live only in `src/config/env.ts` |
| Tests independent | Each test logs in through the fixture and builds its own cart. The parallel Chromium run did not show an order dependency. A shuffled `--repeat-each` was not run |

What I would add before trusting a larger AI-generated suite: one assertion that would fail if the behavior was removed, a run on Firefox, WebKit and the Pixel 7 project, and a test that listens for `pageerror` so a thrown error cannot pass silently.

## B3. Defect report

| | |
|---|---|
| **ID** | DEF-001 |
| **Title** | Checkout proceeds when the cart is empty and shows a $0 total |
| **Product** | Sauce Demo, https://www.saucedemo.com |
| **Environment** | Desktop Chromium, Playwright, 28 Oct 2026. User `standard_user` |
| **Related case** | TC12, assumption A4 |
| **Severity** | Major |
| **Priority** | P2 |

**Expected.** Checkout is blocked, or the cart tells the customer there is nothing to buy. No $0 order is offered.

**Actual.** Checkout opens with no product rows. After valid customer details, the summary shows Item total $0, Tax $0.00 and Total $0.00. Finish changes the address bar to `/checkout-complete.html` while the page still shows "Checkout: Overview" and the Finish button. "Thank you for your order!" is not shown.

**Steps**

1. Log in as `standard_user`.
2. Open the cart. Confirm there are no product rows.
3. Click Checkout.
4. Enter first name `Avinash`, last name `Reddy`, postal code `500034`, then Continue.
5. Read the price totals and click Finish.

**Notes.** The cart page shows only the QTY and Description headers, and the Checkout button is still enabled. There is no screenshot in this file; the steps were run in Chromium against the public site.

## B4. Message to the client

Hello,

I have finished a first pass of the shop-and-checkout tests on Sauce Demo. Twenty-three automated checks pass on Chromium, covering login, sorting, the cart, checkout validation, order totals, logout, and the PDF download. Firefox, Safari and the phone-size project are in the config and have not been run yet.

One defect needs a decision. A customer with an empty cart can click Checkout and reach a summary of Item total $0, Tax $0.00, Total $0.00. Finish then changes the URL to the complete page without showing "Thank you for your order!". I assumed checkout would be blocked. Please confirm whether an empty cart should be stopped, and I will add the automated test.

Three other rules are still assumptions, so I have not automated them: postal-code format, which characters are valid in the name fields, and whether the cart should survive logout and a new login. The PDF test currently checks that a real PDF file downloads. I still need you to confirm which order details must be inside it before I assert the contents.

I can walk through the report and the empty-cart steps whenever it suits you.

Thank you

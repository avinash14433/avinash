# A1 – Manual test suite: Shop and check out (Sauce Demo)

> "As a registered customer, I want to log in, browse and sort products, add them to my cart and check out, so that I can place an order."

**Common pre-condition (TC03–TC21, TC24):** logged in as `standard_user`, on `/inventory.html`, cart empty. Each case sets up its own cart so it can run on its own.

## 1. Questions for the product owner and working assumptions

| # | Question | Assumption I test against (no answer received) |
|---|---|---|
| Q1 | Is the postal code checked against a format (e.g. 6-digit PIN, 5-digit ZIP)? | **A1:** No format check. Any non-empty value is accepted. |
| Q2 | What is the tax rate? Is it fixed or based on location? | **A2:** Fixed 8% of the item total, rounded to the cent. |
| Q3 | Are spaces-only, special characters or 100+ character names valid? Is there a max length? | **A3:** Spaces-only is treated as empty and rejected; long input is handled without a crash or layout break. |
| Q4 | Should checkout be allowed when the cart is empty? | **A4:** No. It should be blocked or show a message. If it is allowed, I log a defect. |
| Q5 | Should the cart survive a page refresh and a logout/login? | **A5:** Yes, the cart persists for the same user. |
| Q6 | What must the "Generate PDF order" file contain (order number, date, items, total, customer details), and should it download or open in a new tab? | **A6:** It contains the ordered items, the total and the customer's name and postal code; either download or new tab is acceptable. |
| Q7 | Which browsers and devices are supported, and what is the accessibility target? | **A7:** Latest Chrome, Firefox and Safari, mobile from 375 px wide, WCAG 2.1 AA. |
| Q8 | Is there an API or database we can test against? | **A8:** No, so all checks go through the UI. |

## 2. Test cases

| ID | Area | Type | Title | Pre-conditions | Steps | Test data | Expected result | Priority | Automate? (Yes / No) and why |
|---|---|---|---|---|---|---|---|---|---|
| TC01 | Login | Positive | Standard user logs in | On the login page | 1. Enter username and password<br>2. Click Login | standard_user / shared password | Redirected to /inventory.html; "Products" title; 6 items | P1 | Yes – smoke test on every build |
| TC02 | Login | Negative | Locked-out user is blocked | On the login page | 1. Enter locked-out user and password<br>2. Click Login | locked_out_user | Stays on login page; error "Sorry, this user has been locked out." | P1 | Yes – core business rule |
| TC03 | Sort | Positive | Sort by name A→Z and Z→A | Common | 1. Select "Name (Z to A)"<br>2. Select "Name (A to Z)" | 6 default products | Z→A: all names descending; A→Z: all names ascending | P2 | Yes – full-list check is slow by hand |
| TC04 | Sort | Positive | Sort by price low→high and high→low | Common | 1. Select "Price (low to high)"<br>2. Select "Price (high to low)" | 6 default products | Low→high: $7.99 → $9.99 → $15.99 → $15.99 → $29.99 → $49.99; high→low: the reverse | P1 | Yes – business rule, regression-prone |
| TC05 | Sort | Positive | Sort order persists after adding items | Common | 1. Select "Price (low to high)"<br>2. Add Onesie and Bike Light | Onesie, Bike Light | Product order and dropdown value stay "Price (low to high)" | P2 | Yes – catches re-render bugs |
| TC06 | Cart | Positive | Add single and multiple items | Common | 1. Click "Add to cart" on Onesie<br>2. Add Bike Light and Bolt T-Shirt | Onesie, Bike Light, Bolt T-Shirt | After step 1: badge 1, Onesie shows "Remove"; after step 2: badge 3, all three show "Remove" | P1 | Yes – smoke |
| TC07 | Cart | Positive | Add two items, remove one from inventory page | Common | 1. Add Onesie and Bike Light<br>2. Click "Remove" on Onesie<br>3. Open cart | Onesie, Bike Light | Badge 2 → 1; Onesie button back to "Add to cart"; cart shows only Bike Light | P1 | Yes – core cart rule |
| TC08 | Cart | Positive | Cart persists on refresh | Common | 1. Add 3 items<br>2. Refresh the page | Onesie, Bike Light, Bolt T-Shirt | Badge stays 3; all three still show "Remove" | P2 | Yes – state persistence |
| TC09 | Cart | Positive | Cart contents and Continue Shopping | Common | 1. Add 3 items, open cart<br>2. Check each row<br>3. Click "Continue Shopping" | Onesie $7.99, Bike Light $9.99, Bolt T-Shirt $15.99 | Each item shows QTY 1, name, description and correct price; Continue Shopping returns to inventory with badge 3 | P2 | Yes – data check across pages |
| TC10 | Cart | Positive | Remove item from the cart page | Common | 1. Add 3 items, open cart<br>2. Click "Remove" on Bolt T-Shirt | Onesie, Bike Light, Bolt T-Shirt | Bolt T-Shirt disappears; badge 3 → 2 | P1 | Yes – second removal path |
| TC11 | Checkout | Positive | Go to checkout and enter valid info | Common | 1. Add Onesie, open cart, click "Checkout"<br>2. Enter details, click "Continue" | Avinash / Reddy / 500034 | Step 1: /checkout-step-one.html; step 2: /checkout-step-two.html | P1 | Yes – critical path |
| TC12 | Checkout | Negative | Checkout with an empty cart | Common, cart empty | 1. Open cart<br>2. Click "Checkout" | – | Checkout is blocked or shows a message (A4). If it proceeds, log a defect. | P2 | No – expected behaviour unconfirmed (Q4); automate once agreed |
| TC13 | Checkout | Negative | First name missing | Onesie in cart, on step one | 1. Leave First Name blank, fill the rest<br>2. Click "Continue" | "" / Reddy / 500034 | "Error: First Name is required"; stays on step one | P1 | Yes – parameterized with TC14–15 |
| TC14 | Checkout | Negative | Last name missing | Onesie in cart, on step one | 1. Leave Last Name blank, fill the rest<br>2. Click "Continue" | Avinash / "" / 500034 | "Error: Last Name is required"; stays on step one | P1 | Yes – parameterized with TC13, TC15 |
| TC15 | Checkout | Negative | Postal code missing | Onesie in cart, on step one | 1. Leave Zip blank, fill the rest<br>2. Click "Continue" | Avinash / Reddy / "" | "Error: Postal Code is required"; stays on step one | P1 | Yes – parameterized with TC13–14 |
| TC16 | Checkout | Boundary | Invalid field input | Onesie in cart, on step one | 1. Enter spaces only, Continue<br>2. Enter special characters, Continue<br>3. Enter a 100+ character string, Continue | "   " ; `<script>`, `@#$%` ; 101 × "a" | Input validated or handled gracefully (A3); no crash, no script runs, no layout break | P2 | No – rules unconfirmed (Q3); explore manually first |
| TC17 | Checkout | Positive | Cancel at step one and at overview | Onesie and Bike Light in cart | 1. Click "Checkout", then "Cancel" on step one<br>2. Click "Checkout", enter valid info, "Continue"<br>3. Click "Cancel" on the overview | Onesie, Bike Light; Avinash / Reddy / 500034 | Step 1: back to /cart.html, items kept; step 3: back to inventory, badge still 2, no order placed | P2 | Yes – navigation rules (two automated tests) |
| TC18 | Checkout | Positive | Overview items, payment and shipping | Onesie and Bike Light in cart | 1. Checkout, enter valid info, Continue<br>2. Check the overview | Onesie, Bike Light | Lists only Onesie and Bike Light; shows "SauceCard #31337" and "Free Pony Express Delivery!" | P2 | Yes – data check |
| TC19 | Checkout | Positive | Complete the order with correct totals | Onesie and Bike Light in cart, on step two | 1. Check Item total, Tax, Total<br>2. Click "Finish" | Onesie $7.99 + Bike Light $9.99 | Item total $17.98; Tax $1.44 (8%); Total $19.42 = item total + tax; /checkout-complete.html shows "Thank you for your order!"; badge cleared; cart empty | P1 | Yes – end-to-end critical path |
| TC20 | Checkout | Positive | Back Home after order | Order just completed | 1. Click "Back Home" | – | Returns to inventory; cart empty; all 6 buttons show "Add to cart" | P2 | Yes – post-order state |
| TC21 | Checkout | Positive | Generate PDF order | Order just completed for Onesie and Bike Light | 1. Click "Generate PDF order"<br>2. Open the PDF | Avinash / Reddy / 500034 | A PDF downloads or opens and shows Onesie and Bike Light, the total $19.42 and the customer details | P2 | Partial – automated test checks a valid PDF is downloaded and attaches it to the report; content checked by eye until a PDF text parser is added |
| TC22 | Security | Negative | Inventory page blocked after logout | Logged in | 1. Log out from the menu<br>2. Type /inventory.html in the address bar | standard_user | Login page with "You can only access '/inventory.html' when you are logged in." | P1 | Yes – security rule, smoke |
| TC23 | Usability | Positive | Error messages are clear and can be dismissed | On login page / checkout step one | 1. Trigger an empty-field error<br>2. Read the message and check field highlight<br>3. Click X on the error | – | Message says what to fix; fields highlighted; X clears message and highlight | P3 | No – clarity of wording needs human judgement |
| TC24 | Browser / screen size | Positive | Full flow on Firefox, Safari and a 375 px phone | Common | 1. Run TC01, TC06 and TC20 on Firefox and WebKit<br>2. Repeat on a 375×812 viewport | standard_user | Same results as Chrome; on mobile no horizontal scroll, menu and buttons usable | P2 | Partial – functional tests run as browser and mobile projects; layout checked by eye |
| TC25 | Accessibility | Positive | Keyboard-only login and checkout | On login page, no mouse | 1. Tab through login, press Enter<br>2. Tab to "Add to cart", cart and "Checkout"<br>3. Complete the form by keyboard | standard_user | Every control reachable in logical order; focus visible; fields have labels; errors announced | P2 | No – needs human review; add an axe-core scan later |

## 3. Exploratory charter – user with known problems (15 min)

| | |
|---|---|
| **Explore** | Products, cart and checkout as `problem_user` |
| **With** | Chrome with DevTools open (Console and Network); a `standard_user` session in a second window for comparison |
| **To discover** | Product data that differs from the standard user (names, images, prices), sorting that doesn't work, Add/Remove buttons that fail, form fields that don't keep input, wrong totals, console errors |
| **Time split** | 3 min products and images · 4 min sorting and cart · 6 min checkout form and totals · 2 min notes |
| **Output** | Session notes, a defect for each confirmed issue with a screenshot, and new questions for the PO |

## 4. Strategy (under 150 words)

**UI layer (Playwright):** TC01–TC11, TC13–TC15, TC17–TC22 (TC21 partly). These are the critical path and change rarely. A smoke tag (TC01, TC02, TC04, TC06, TC19, TC22) runs on every build. The full set runs nightly on Chromium, Firefox, WebKit and a mobile viewport (TC24).

**API or unit layer, if the client has one:** sort ordering, tax and total calculation, checkout field validation and the login guard. These are logic checks that run faster and more precisely below the UI.

**Manual:** exploratory testing (problem_user), keyboard and screen-reader accessibility (TC25), layout (TC24), error-message clarity (TC23), and cases with unconfirmed rules (TC12, TC16), and the content of the order PDF (TC21).

**Biggest remaining risk:** checkout is allowed with an empty cart if Q4 is not resolved, and there is no visible backend, so we cannot confirm an order is stored. Totals are only checked as displayed and in the PDF.

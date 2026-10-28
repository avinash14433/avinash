# AI usage

I used Cursor's coding assistant to draft the manual cases, the Playwright suite, and these write-ups. Each row is something I asked for, then what I actually checked. A box is ticked only when that check was done.

| # | Area | What I asked for | What I checked / changed |
|---|---|---|---|
| 1 | A1 | Draft PO questions, assumptions and 25 test cases for the shop-and-checkout use case | Kept TC12 and TC16 manual because Q4 and Q3 are unconfirmed. Compared the locked-out message, the three required-field messages, and the payment and shipping labels with the strings the specs assert. On 28 Oct 2026 I reproduced TC12 on the live site and wrote it up as DEF-001 in `ANSWERS.md`. |
| 2 | A1 | Draft the exploratory charter and strategy | The charter is still a plan. I have not run a `problem_user` session, so there are no session notes. The smoke list in the strategy matches the `@smoke` tags in the specs: TC01, TC02, TC04, TC06, TC19, TC22. |
| 3 | A2 | Scaffold Playwright config, page objects and fixtures | Locators use `data-test`, with two exceptions: the menu button (accessible name "Open Menu"; the live `data-test` is `open-menu` on the icon) and "Generate PDF order" (no `data-test`, so it stays a role and name locator). The public URL and password sit in `src/config/env.ts`, not in test bodies. |
| 4 | A2 | Write the automated tests from the manual cases | `npm test` on 28 Oct 2026: 23 passed on Chromium in about 1 minute. I did not run `npm run test:all-browsers`, and I did not break an assertion on purpose. Review notes are in `ANSWERS.md` B1, including the weak PDF check and the soft tax assertions. |
| 5 | A2 | Draft README and the traceability table | The table matches the 23 Chromium tests. I corrected the CI sentence: the workflow runs on push and pull request and executes every browser project. I added the Windows `copy` command next to `cp`. |

## How I verified AI output

- [x] Ran `npm test` (Chromium, 28 Oct 2026): 23 passed
- [ ] Ran `npm run test:all-browsers`
- [ ] Broke a test on purpose (for example a wrong price order) and confirmed it fails and saves a screenshot
- [x] Checked the cart, empty-cart checkout, overview totals and the PDF control against the live site. Required-field and locked-out strings are the ones the specs expect
- [x] Checked no fixed sleeps, URLs or credentials in test bodies. Search of `tests/` found no `waitForTimeout`, `saucedemo` or `secret_sauce`. Defaults are in `src/config/env.ts`
- [x] Chromium run used 7 workers with `fullyParallel: true` and all tests passed. A shuffled repeat was not run

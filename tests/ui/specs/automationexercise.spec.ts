import { test, expect } from '../fixtures/automationExercise';
import type { Fixtures } from '../fixtures/automationExercise'


/**
 * End‑to‑end test against AutomationExercise demonstrating a
 * login, add‑to‑cart and checkout flow.  The test uses
 * page object models defined in the pages directory to
 * encapsulate page interactions.  To run this test you
 * should set the environment variables AE_EMAIL and
 * AE_PASSWORD to a valid account on the site.  If the user
 * is not logged in when proceeding to checkout, the site
 * will display a modal prompting for login, which this test
 * does not handle.
 */
test('login, add to cart and proceed to checkout', { tag: '@auto-exr' }, async ({ automationExercise }: Fixtures) => {
  const email = process.env.AE_EMAIL || '';
  const password = process.env.AE_PASSWORD || '';

  await automationExercise.navigateToFullUrl('https://automationexercise.com/');
  await automationExercise.login.login(email, password)
  await automationExercise.productDetails.setQuantity(1)
  await automationExercise.productDetails.addToCart()
  await automationExercise.productDetails.viewCart()

  // const cartPage = new CartPage(page);
  // const containsProduct = await cartPage.hasProduct('Blue Top');
  // expect(containsProduct).toBe(true);
  // await cartPage.proceedToCheckout();
});
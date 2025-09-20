import { test, expect } from "../../fixtures/session";
import { ConfigManager } from "../../../src/framework";
import { AutomationExercise } from "../pages/automation-exercise/AutomationExercise";

let config: ConfigManager;

test.beforeAll(async () => {
  config = ConfigManager.getInstance();
});

/**
 * End‑to‑end test against AutomationExercise demonstrating a
 * login, add‑to‑cart and checkout flow.
 */
test(
  "login, add to cart and proceed to checkout",
  { tag: "@auto-exr" },
  async ({ session }) => {
    const email = process.env.AE_EMAIL as string;
    const password = process.env.AE_PASSWORD as string;
    const automationExercise = await session.pages(AutomationExercise);

    await automationExercise.navigateToFullUrl(
      config.get("automationExerciseBaseUrl") as string,
    );
    await automationExercise.login.goto();
    await automationExercise.login.login(email, password);
    await automationExercise.productDetails.goto();
    await automationExercise.productDetails.addToCart("Blue Top");
    await automationExercise.productDetails.viewCart();
    const containsProduct =
      await automationExercise.cart.hasProduct("Blue Top");
    expect(containsProduct).toBe(true);
    await automationExercise.cart.proceedToCheckout();
  },
);

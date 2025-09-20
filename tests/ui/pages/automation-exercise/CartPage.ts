import { Page } from "@playwright/test";
import { BasePage } from "../BasePage";

/**
 * CartPage models the shopping cart view.  It exposes
 * convenience methods to verify that items are present and
 * proceed to checkout.  The cart page is located at
 * `/view_cart` and includes a “Proceed To Checkout” button
 * styled with the class `check_out`.
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private readonly checkOutButton = ".check_out";

  /**
   * Verify that the cart contains a product by its name.  Returns
   * true if at least one row in the cart’s table contains the
   * provided text.  You can use this assertion in your tests.
   */
  async hasProduct(productName: string): Promise<boolean> {
    const rows = this.page.locator("tr");
    const count = await rows.filter({ hasText: productName }).count();
    return count > 0;
  }

  /**
   * Click the “Proceed To Checkout” button.  On Automation Exercise
   * this button uses the class `check_out`.  When clicked without
   * being logged in, the site displays a modal prompting the user
   * to login.  Tests should handle the resulting page accordingly.
   */
  async proceedToCheckout(): Promise<void> {
    await this.page.click(this.checkOutButton);
  }
}

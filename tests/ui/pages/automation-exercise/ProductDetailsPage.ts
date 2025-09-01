import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * ProductDetailsPage encapsulates interactions with a single
 * product detail page.  Test code can specify the product
 * identifier to navigate directly without relying on the
 * products listing.  The page exposes methods to change
 * quantity, add the product to the cart, and navigate to the
 * cart view.
 */
export class ProductDetailsPage extends BasePage {

  constructor(page: Page) {
    super(page)
  }

  /**
   * Set the quantity of the item before adding it to the cart.
   * If you don’t call this method the default quantity (1) is
   * used.  On the product page the quantity input has id
   * `quantity`.
   */
  async setQuantity(quantity: number): Promise<void> {
    const qtyInput = this.page.locator('input#quantity');
    // Ensure the input is present before interacting
    await qtyInput.waitFor();
    // Clear any existing value and type the new quantity
    await qtyInput.fill(String(quantity));
  }

  /**
   * Click the “Add to cart” button.  On the product details
   * page the button has classes `btn` and `cart`.
   */
  async addToCart(): Promise<void> {
    await this.page.click('button.cart');
    // Wait for the “Added!” message or modal; the site displays
    // a small toast with a View Cart link.  We wait for that
    // link to appear to ensure the item was added.
    await this.page.waitForSelector('a:has-text("View Cart")');
  }

  /**
   * Click the View Cart link that appears after adding to cart.
   */
  async viewCart(): Promise<void> {
    await this.page.click('a:has-text("View Cart")');
  }
}
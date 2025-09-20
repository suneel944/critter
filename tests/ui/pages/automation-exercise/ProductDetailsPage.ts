import { Page } from "@playwright/test";
import { BasePage } from "../BasePage";

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
    super(page);
  }

  // Selectors
  private readonly productLink = "a[href='/products']";
  private readonly addToCartButton = (productName: string): string =>
    `xpath=(.//p[text()="${productName}"]//following-sibling::a)[1]`;
  private readonly viewCartLink = "a:has-text('View Cart')";

  async goto(): Promise<void> {
    await this.page.click(this.productLink);
  }

  /**
   * Click the “Add to cart” button.  On the product details
   * page the button has classes `btn` and `cart`.
   */
  async addToCart(productName: string): Promise<void> {
    await this.page.click(this.addToCartButton(productName));

    // Wait for the “Added!” message or modal the site displays
    // a small toast with a View Cart link.  We wait for that
    // link to appear to ensure the item was added.
    await this.page.waitForSelector(this.viewCartLink);
  }

  /**
   * Click the View Cart link that appears after adding to cart.
   */
  async viewCart(): Promise<void> {
    await this.page.click(this.viewCartLink);
  }
}

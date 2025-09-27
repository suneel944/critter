import { BasePage } from '../BasePage'
import type { Page } from '@playwright/test'


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

  // Selectors
  private readonly productLink = "a[href='/products']"
  private readonly addToCartButton = (productName: string): string =>
    `xpath=(.//p[text()="${productName}"]//following-sibling::a)[1]`
  private readonly viewCartLink = "a:has-text('View Cart')"

  async goto(): Promise<void> {
    await this.page.click(this.productLink)
  }

  /**
   * Click the “Add to cart” button.  On the product details
   * page the button has classes `btn` and `cart`.
   */
  async addToCart(productName: string): Promise<void> {
    await this.page.click(this.addToCartButton(productName))
    await this.page.locator(this.viewCartLink).waitFor({ state: 'visible' })
  }

  /**
   * Click the View Cart link that appears after adding to cart.
   */
  async viewCart(): Promise<void> {
    await this.page.click(this.viewCartLink)
  }
}

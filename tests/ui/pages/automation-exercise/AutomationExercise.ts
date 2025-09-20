import type { Page } from "@playwright/test"
import { LoginPage } from "./LoginPage"
import { ProductDetailsPage } from "./ProductDetailsPage"
import { CartPage } from "./CartPage"
import { BasePage } from "../BasePage"

export class AutomationExercise extends BasePage {
  constructor(readonly page: Page) {
    super(page)
  }

  get login() {
    return this.getPageObject('login', () => new LoginPage(this.page))
  }

  get productDetails() {
    return this.getPageObject('productDetails', () => new ProductDetailsPage(this.page))
  }

  get cart() {
    return this.getPageObject('cart', () => new CartPage(this.page))
  }
}

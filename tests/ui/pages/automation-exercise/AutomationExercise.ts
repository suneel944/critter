import { CartPage } from './CartPage'
import { LoginPage } from './LoginPage'
import { ProductDetailsPage } from './ProductDetailsPage'
import { BasePage } from '../BasePage'
import type { Page } from '@playwright/test'

export class AutomationExercise extends BasePage {
  constructor(page: Page) {
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

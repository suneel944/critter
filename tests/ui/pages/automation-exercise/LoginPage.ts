import { Page } from "@playwright/test";
import { BasePage } from "../BasePage";

/**
 * LoginPage models the login form on Automation Exercise.
 * It provides methods to navigate to the login page and
 * authenticate an existing user.  The data‑qa attributes on
 * the form inputs make it easy to locate the fields without
 * relying on brittle CSS selectors.
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private readonly loginLink = "a[href='/login']";
  private readonly editField = (fieldName: "email" | "password"): string =>
    `input[data-qa="login-${fieldName}"]`;
  private readonly loginSubmitButton = "button[data-qa='login-button']";

  async goto(): Promise<void> {
    await this.page.click(this.loginLink);
  }

  /**
   * Fill in the login form and submit it.  Assumes that
   * `goto()` has been called beforehand or that the caller
   * navigates to the login page manually.
   *
   * @param email Registered user’s email address
   * @param password Registered user’s password
   */
  async login(email: string, password: string): Promise<void> {
    await this.page.fill(this.editField("email"), email);
    await this.page.fill(this.editField("password"), password);
    await this.page.click(this.loginSubmitButton);
  }
}

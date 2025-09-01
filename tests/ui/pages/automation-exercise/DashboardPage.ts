import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Example Page Object for a Dashboard page.  Provides methods for verifying
 * page state and interacting with dashboard components.  Replace selectors
 * with real ones from your application.
 */
export class DashboardPage extends BasePage {
  
  constructor(page: Page) {
    super(page)
  }

  private get heading() { return this.page.locator('h1'); }
  private get userMenu() { return this.page.locator('#userMenu'); }
  private get logoutButton() { return this.page.locator('#logout'); }

  async isLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
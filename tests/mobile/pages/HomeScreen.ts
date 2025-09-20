import { $ } from "@wdio/globals"
/**
 * Example Screen Object Model for a mobile home screen using WebdriverIO.
 * Each screen class encapsulates selectors and actions for a particular view
 * in the mobile application.  When using TypeScript with WebdriverIO, the
 * global `browser` object provides access to the driver.
 */
export class HomeScreen {
  // Example selectors using Android UiSelector or iOS predicate strings
  private get menuButton() {
    return $("~menuButton")
  }
  private get welcomeText() {
    return $("~welcomeText")
  }

  async isLoaded(): Promise<boolean> {
    return this.welcomeText.isDisplayed()
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click()
  }
}

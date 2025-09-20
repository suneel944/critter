import type { Page } from "@playwright/test"
import { ConfigManager } from "../../../src/framework"

export class BasePage {
  protected readonly page: Page
  protected configManager: ConfigManager

  constructor(page: Page) {
    this.page = page
    this.configManager = ConfigManager.getInstance()
  }

  protected _instances = new Map<string, unknown>()

  protected getPageObject<K>(key: string, factory: () => K): K {
    if (!this._instances.has(key)) {
      this._instances.set(key, factory())
    }
    return this._instances.get(key) as K
  }

  async navigateToFullUrl(url: string): Promise<void> {
    await this.page.goto(url)
  }
}

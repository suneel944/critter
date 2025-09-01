import { Page } from '@playwright/test'
import { ConfigManager } from '../../../src/framework'


export class BasePage {
    protected page: Page
    protected configManager: ConfigManager

    constructor (page: Page) {
        this.page = page
        this.configManager = ConfigManager.getInstance()
    }

    async navigateToFullUrl(url: string): Promise<void> {
        await this.page.goto(url)
    }
}
import { $ } from "@wdio/globals";

export class SettingsScreen {
  private get themeToggle() {
    return $("~themeToggle");
  }
  private get logoutButton() {
    return $("~logoutButton");
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}

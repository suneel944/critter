import { test, expect } from "../../fixtures/session";
import { ConfigManager } from "../../../src/framework";

let config: ConfigManager;

test.beforeAll(async () => {
  config = ConfigManager.getInstance();
});

// Sample Playwright UI test.  This test simply navigates to the base URL and
// asserts that the page loads.  Replace with your own tests and page objects.

test(
  "sample home page loads",
  { tag: ["@unit-ui"] },
  async function ({ session }) {
    const adapter = await session.web();
    await adapter.navigate(String(config.get("exampleBaseUrl")));
    const title = String(await adapter.execute("title"));
    expect(title).toMatch(/Example/);
  },
);

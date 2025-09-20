import { test, expect } from "../../fixtures/session"
import { CapabilityBuilder } from "../../../src/framework/capabilities/CapabilityBuilder"
import type { Caps } from "../../../src/framework/capabilities/CapabilityBuilder"

let caps: Caps

test.beforeAll(async () => {
  caps = CapabilityBuilder.android()
    .browserName("Chrome")
    .udid("10AD7N1862001AS")
    .platformVersion("15.0")
    .build()
})

test(
  "Can launch Chrome on device",
  { tag: "@android" },
  async ({ session }) => {
    const adapter = await session.mobile(caps, { provider: "local" })
    await adapter.navigate("https://example.com")
    const title = String(await adapter.execute("title"))
    expect(title.toLowerCase()).toContain("example")
  },
)

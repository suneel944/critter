// scripts/device-broker-tools/registerDevice.ts
import DeviceBroker from "../../src/framework/core/DeviceBroker"
import Logger from "../../src/framework/shared/logger"

function formatErr(e: unknown): string {
  if (e instanceof Error) {
    return `${e.name}: ${e.message}${e.stack ? `\n${e.stack}` : ""}`
  }
  try { return JSON.stringify(e) } catch { return String(e) }
}

async function main(): Promise<void> {
  const broker = new DeviceBroker()

  // Acquire a session and do your registration work
  const session = await broker.getMobileDriver()
  Logger.info("Acquired a mobile session for registration")

  // Release underlying driver, then cleanup
  await broker.releaseDriver(session.driver)
  await broker.cleanup()

  Logger.info("Device registration completed")
}

main().catch((err: unknown) => {
  Logger.error(`Failed to register device: ${formatErr(err)}`)
  process.exit(1)
})

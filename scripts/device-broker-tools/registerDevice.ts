import { DeviceBroker, Logger, type ProviderOptions } from '@critter'

type Args = {
  platform?: 'android' | 'ios'
  deviceName?: string
  osVersion?: string
  app?: string
}

/** Parse very small --key=value CLI flags. */
function parseArgs(): Args {
  const out: Args = {}
  for (const raw of process.argv.slice(2)) {
    if (!raw.startsWith('--')) continue
    const [key, value = ''] = raw.slice(2).split('=', 2)
    switch (key) {
      case 'platform': out.platform = value === 'ios' ? 'ios' : 'android'; break
      case 'deviceName': out.deviceName = value; break
      case 'osVersion': out.osVersion = value; break
      case 'app': out.app = value; break
    }
  }
  return out
}

/** Build a ProviderOptions object without inserting undefined keys. */
function buildProviderOptions(): ProviderOptions {
  const a = parseArgs()

  // Prefer CLI flags, then env; default platform to android.
  const platform = a.platform ?? (process.env.DEVICE_PLATFORM === 'ios' ? 'ios' : 'android')
  const deviceName = a.deviceName ?? process.env.DEVICE_NAME
  const osVersion = a.osVersion ?? process.env.OS_VERSION
  const app = a.app ?? process.env.APP

  const opts: Record<string, unknown> = { platformName: platform }
  if (deviceName) opts.deviceName = deviceName
  if (osVersion) opts.osVersion = osVersion
  if (app) opts.app = app

  // Cast at the boundary—actual providers/cap builder will normalize.
  return opts as unknown as ProviderOptions
}

function formatErr(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}${e.stack ? `\n${e.stack}` : ''}`
  try { return JSON.stringify(e) } catch { return String(e) }
}

async function main(): Promise<void> {
  const broker = new DeviceBroker()
  const options = buildProviderOptions()

  Logger.info({ options }, 'Requesting mobile session for registration')

  // Acquire a session and do your registration work
  const session = await broker.getMobileDriver(options)
  Logger.info('Acquired a mobile session for registration')

  try {
    // TODO: perform your registration logic with `session.driver`
  } finally {
    // Always release and cleanup
    await broker.releaseDriver(session.driver)
    await broker.cleanup()
    Logger.info('Device registration completed')
  }
}

main().catch((err: unknown) => {
  Logger.error(`Failed to register device: ${formatErr(err)}`)
  process.exit(1)
})

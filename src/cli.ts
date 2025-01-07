import { parseArgs } from 'node:util'

import { createConnection } from './connection.js'

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    version: {
      type: 'boolean',
      short: 'v',
    },
  },
  strict: true,
  allowPositionals: true,
})

if (values.version) {
  const pkg = await import('../package.json')
  await Bun.write(Bun.stdout, pkg.version)

  process.exit(0)
}

createConnection().listen()

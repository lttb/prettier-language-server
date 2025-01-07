import { parseArgs } from 'node:util'

import { createConnection } from './connection.js'

const { values } = parseArgs({
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
	const pkg = require('../package.json')
	process.stdout.write(pkg.version)

	process.exit(0)
}

setTimeout(() => {
	process.exit(0)
}, 1000)

createConnection().listen()

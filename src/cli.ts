import { version } from '../package.json'

async function main() {
	const { parseArgs } = await import('node:util')
	const { createConnection } = await import('./connection')

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
		process.stdout.write(version)

		process.exit(0)
	}

	const conn = await createConnection()

	conn.listen()
}

main()

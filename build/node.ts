import * as path from 'node:path'

import { dependencies } from '../package.json'

await Bun.build({
	entrypoints: [path.join(import.meta.dir, '../index.ts')],
	target: 'node',
	minify: true,
	format: 'cjs',
	outdir: path.join(import.meta.dir, '../bin/'),
	naming: 'prettierls ',
	external: Object.keys(dependencies),
})

import * as path from 'node:path'

await Bun.build({
	entrypoints: [path.join(import.meta.dir, '../index.ts')],
	target: 'node',
	minify: true,
	format: 'cjs',
	sourcemap: 'inline',
	outdir: path.join(import.meta.dir, '../bin/'),
	naming: 'pretterls',
	external: [
		'vscode-languageserver-textdocument',
		'vscode-languageserver',
		'vscode-uri',
		'prettier',
	],
})

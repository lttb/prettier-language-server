await Bun.build({
	entrypoints: ['./index.ts'],
	target: 'node',
	format: 'cjs',
	minify: true,
	//sourcemap: 'linked',
	outdir: './bin/',
	naming: 'pretterls.js',
	external: [
		'vscode-languageserver-textdocument',
		'vscode-languageserver',
		'vscode-uri',
		'prettier',
	],
})

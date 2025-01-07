import type {
	Connection,
	WorkspaceFolder,
	InitializeResult,
} from 'vscode-languageserver/node'
import type { Options as PrettierOptions } from 'prettier'

export async function createConnection(): Promise<Connection> {
	const nodePath = await import('node:path')
	const prettier = await import('prettier')
	const { URI } = await import('vscode-uri')
	const { TextDocument } = await import('vscode-languageserver-textdocument')

	// cjs
	const lsp = await import('vscode-languageserver/node.js')

	const textDocuments = new lsp.TextDocuments(TextDocument)

	const connection = lsp.createConnection(process.stdin, process.stdout)

	textDocuments.listen(connection)

	let folder: WorkspaceFolder | undefined

	let workspacePrettierConfigFile: string | null
	let workspacePrettierConfig: PrettierOptions | null

	async function setWorkspaceConfig(searchPath: string) {
		workspacePrettierConfigFile ??= await prettier.resolveConfigFile(searchPath)
		workspacePrettierConfig ??= await prettier.resolveConfig(searchPath, {
			editorconfig: true,
			useCache: false,
			...(workspacePrettierConfigFile && {
				config: workspacePrettierConfigFile,
			}),
		})
	}

	async function resolvePrettierConfig(searchPath: string) {
		// TODO: maybe support default config from lsp setup

		// prioritise workspace config over file-level search
		if (workspacePrettierConfig) return workspacePrettierConfig

		const prettierConfig = await prettier.resolveConfig(searchPath, {
			editorconfig: true,
			useCache: true,
		})

		return prettierConfig
	}

	async function prettierFormat(
		uri: string,
		code: string,
		options?: PrettierOptions,
	) {
		const filepath = URI.parse(uri).fsPath

		const prettierConfig = await resolvePrettierConfig(filepath)

		const formattedCode = await prettier.format(code, {
			...prettierConfig,
			...options,
			filepath,
		})

		return formattedCode
	}

	connection.onInitialize(async ({ workspaceFolders }) => {
		folder = workspaceFolders?.[0]

		if (folder) {
			await setWorkspaceConfig(
				// prettier doesn't support folders, so that's a workaround
				nodePath.join(URI.parse(folder.uri).fsPath, '_'),
			)
		}

		const result: InitializeResult = {
			capabilities: {
				textDocumentSync: lsp.TextDocumentSyncKind.Incremental,
				documentFormattingProvider: true,
				documentRangeFormattingProvider: true,
			},
		}

		return result
	})

	connection.onDocumentFormatting(async (params, token) => {
		const textDocument = textDocuments.get(params.textDocument.uri)

		if (!textDocument) {
			return null
		}

		const originalText = textDocument.getText()

		const start = { line: 0, character: 0 }
		const end = textDocument.positionAt(originalText.length)
		const range = lsp.Range.create(start, end)

		const formattedText = await prettierFormat(textDocument.uri, originalText)

		return [lsp.TextEdit.replace(range, formattedText)]
	})

	connection.onDocumentRangeFormatting(async (params, token) => {
		const textDocument = textDocuments.get(params.textDocument.uri)

		if (!textDocument) {
			return null
		}

		const originalText = textDocument.getText()

		const rangeStart = textDocument.offsetAt(params.range.start)
		const rangeEnd = textDocument.offsetAt(params.range.end)

		const formattedText = await prettierFormat(textDocument.uri, originalText, {
			rangeStart,
			rangeEnd,
		})

		const formattedTextRanged = formattedText.slice(
			rangeStart,
			rangeEnd + formattedText.length - originalText.length,
		)

		return [lsp.TextEdit.replace(params.range, formattedTextRanged)]
	})

	return connection
}

import * as lsp from 'vscode-languageserver/node'
import { URI } from 'vscode-uri'
import * as prettier from 'prettier'
import * as nodePath from 'node:path'

import { textDocuments } from './textDocuments.js'

export function createConnection(): lsp.Connection {
  const connection = lsp.createConnection(process.stdin, process.stdout)

  textDocuments.listen(connection)

  let folder: lsp.WorkspaceFolder | undefined

  let workspacePrettierConfigFile: string | null
  let workspacePrettierConfig: prettier.Options | null

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
    options?: prettier.Options,
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

    const result: lsp.InitializeResult = {
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

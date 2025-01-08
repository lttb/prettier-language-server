# prettier-language-server

**A lightweight and fast Language Server for Prettier**

The `prettier-language-server` is designed to be simple, fast, and focused, offering only essential features for formatting code with Prettier.

## Features

This language server provides a minimal set of features to ensure fast performance:

- **Range Formatting**: Supports out-of-the-box range-based formatting.
- **No Diagnostics**: Focuses solely on formatting without providing diagnostics.
- **Prettier Config Resolution**: Automatically resolves and caches the Prettier configuration based on the workspace folder.

## Requirements

- **Node.js** version >= 13.2 is required.

## Installation

To install globally via npm, run:

```sh
npm i -g prettier-language-server
```

## Configuration for Neovim

If you're using [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig), you can configure the `prettier-language-server` as follows:

### Define the Language Server Configuration

Create a new configuration file at `lua/lspconfig/configs/prettier_ls.lua` with the following content:

<details>
<summary>lua/lspconfig/configs/prettier_ls.lua</summary>

```lua
local root_file = {
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  '.prettierrc.json5',
  '.prettierrc.js',
  'prettier.config.js',
  '.prettierrc.mjs',
  'prettier.config.mjs',
  '.prettierrc.cjs',
  'prettier.config.cjs',
  '.prettierrc.toml',
}

return {
  default_config = {
    cmd = { 'prettier-language-server' },
    filetypes = {
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'vue',
      'css',
      'scss',
      'less',
      'html',
      'json',
      'jsonc',
      'yaml',
      'markdown',
      'markdown.mdx',
      'graphql',
      'handlebars',
    },
    root_dir = function(fname)
      local util = require('lspconfig.util')

      root_file = util.insert_package_json(root_file, 'prettier', fname)
      return util.root_pattern(unpack(root_file))(fname)
    end,
  },
}
```

</details>

### Initialize the Language Server

Add the following code to initialize the language server:

```sh
require('lspconfig').prettier_ls.setup({})
```

### Credits

- https://github.com/prettier/prettier
- https://github.com/fsouza/prettierd
- https://github.com/microsoft/vscode-languageserver-node

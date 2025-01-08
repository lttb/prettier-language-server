# prettierls

Prettier Language Server

## Features

The idea of this language server is to be as simple and fast as possible,
and the set of the features is quite limited.

- Out of the box Range Formatting
- Doesn't provide diagnostics, only formatting
- Resolves and caches the prettier config based on the workspace folder

## Requirements

- node.js >=13.2

## Installation

```sh
npm i -g prettierls
```

## Neovim Language Server Configuration

<details>
<summary>lua/lspconfig/configs/prettierls.lua</summary>

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
    cmd = { 'pretterls' },
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

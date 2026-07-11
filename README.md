# WX for Zed

Language support for [WX](https://github.com/wxlanguage/wx), a Rust-inspired language that compiles directly to WebAssembly, in the [Zed](https://zed.dev) editor.

## Features

- Syntax highlighting (tree-sitter grammar)
- Diagnostics, hover, completions, and formatting via `wx lsp` — the same language server the [VS Code extension](https://github.com/wxlanguage/vscode) uses

## Status

Not yet published to Zed's extension registry — install it as a dev extension (below) to try it.

The grammar is an early-stage MVP: it gives real structure to top-level items (`fn`, `struct`, `trait`, `impl`, etc. — enough for highlighting and bracket matching), but signatures and bodies are parsed as generic balanced-token groups rather than a full expression grammar. It's been checked against every `.wx` file in the main [wx](https://github.com/wxlanguage/wx) repo with zero parse errors, but it isn't a validating parser.

## Requirements

This extension talks to the `wx` CLI's language server — it doesn't bundle a binary. Install `wx` and make sure it's on your `PATH`:

```bash
npm install -g @wx-lang/cli
```

or build it from source (see the [main README](https://github.com/wxlanguage/wx#readme)).

## Installing as a dev extension

1. Clone this repo.
2. Install Rust via [rustup](https://rustup.rs) (not your OS package manager) and add the WASM target: `rustup target add wasm32-wasip1`.
3. In Zed: open the extensions panel → **Install Dev Extension** → select this folder.
4. Zed compiles the extension and grammar the first time (may take a minute). Open a `.wx` file afterwards to try it.

## Settings

If `wx` isn't on your `PATH`, or you want to point at a specific install, use Zed's standard per-language-server override in `settings.json`:

```json
"lsp": {
  "wx": {
    "binary": {
      "path": "/path/to/wx",
      "arguments": ["lsp"]
    }
  }
}
```

## Feedback

Found a bug or missing feature? [Open an issue](https://github.com/wxlanguage/wx/issues).

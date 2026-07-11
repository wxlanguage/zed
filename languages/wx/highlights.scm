[
  "fn"
  "struct"
  "enum"
  "trait"
  "impl"
  "module"
  "use"
  "import"
  "export"
  "memory"
  "const"
  "global"
  "typeset"
  "pub"
  "mut"
] @keyword

; Keyword-like identifiers inside expression/statement bodies — this
; grammar doesn't structurally distinguish them from other identifiers
; (bodies are parsed as generic token groups), so they're matched by text
; instead.
((identifier) @keyword
  (#any-of? @keyword
    "if" "else" "loop" "break" "continue" "return" "as" "for" "where"
    "local" "self" "Self" "unreachable" "type"))

((identifier) @constant.builtin
  (#any-of? @constant.builtin "true" "false"))

((identifier) @type.builtin
  (#any-of? @type.builtin
    "i8" "i16" "i32" "i64" "u8" "u16" "u32" "u64" "f32" "f64" "bool" "char"))

(line_comment) @comment

(string) @string
(char) @string
(number) @number

(function_item name: (identifier) @function)
(struct_item name: (identifier) @type)
(enum_item name: (identifier) @type)
(trait_item name: (identifier) @type)
(typeset_item name: (identifier) @type)
(import_item name: (string) @string)

(attribute) @attribute

"#" @punctuation.special

["." "," ":" ";" "::"] @punctuation.delimiter

["(" ")" "[" "]" "{" "}" "<" ">"] @punctuation.bracket

["->" "=>" "=" "+" "-" "*" "/" "%" "!" "?" "&" "|" "@" "^"] @operator

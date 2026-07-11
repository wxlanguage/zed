// Pragmatic MVP grammar for WX: real structure for top-level items (so
// outline/highlighting can key off keywords, names, and item boundaries),
// but signatures/bodies are parsed as generic balanced-token groups rather
// than a fully precise expression grammar. Good enough for syntax
// highlighting and bracket matching; a real recursive-descent expression
// grammar is follow-up work, not an MVP blocker.

const PUNCT = [
	"::",
	"->",
	"=>",
	":",
	",",
	".",
	"*",
	"<",
	">",
	"=",
	"+",
	"-",
	"/",
	"%",
	"!",
	"?",
	"&",
	"|",
	"@",
	"^",
];

// Header position (right after an item's name, before its body) never
// contains a runtime `<`/`>` comparison — only generics — so `<...>` is
// parsed as a matched group there (letting embedded where-clause brace
// groups, e.g. `SrcMem: Memory where { Size = Size }`, nest correctly).
// Body/expression position leaves `<`/`>` as plain unmatched tokens, since
// disambiguating generics from comparisons there is a much harder problem
// (and not needed for highlighting/bracket-matching purposes).
const PUNCT_NO_ANGLE = PUNCT.filter((p) => p !== "<" && p !== ">");

module.exports = grammar({
	name: "wx",

	extras: ($) => [/\s/, $.line_comment],

	word: ($) => $.identifier,

	rules: {
		source_file: ($) => repeat($._item),

		_item: ($) =>
			choice(
				$.attribute,
				$.function_item,
				$.struct_item,
				$.enum_item,
				$.trait_item,
				$.impl_item,
				$.module_item,
				$.use_item,
				$.import_item,
				$.export_item,
				$.memory_item,
				$.const_item,
				$.global_item,
				$.typeset_item,
			),

		attribute: ($) => seq("#", $._bracket_group),

		function_item: ($) =>
			seq(
				optional("pub"),
				"fn",
				field("name", $.identifier),
				repeat($._header_token),
				choice($.body, ";"),
			),

		struct_item: ($) =>
			seq(
				optional("pub"),
				"struct",
				field("name", $.identifier),
				repeat($._header_token),
				choice($.body, ";"),
			),

		enum_item: ($) =>
			seq(
				optional("pub"),
				"enum",
				field("name", $.identifier),
				repeat($._header_token),
				$.body,
			),

		trait_item: ($) =>
			seq(
				optional("pub"),
				"trait",
				field("name", $.identifier),
				repeat($._header_token),
				$.body,
			),

		impl_item: ($) => seq("impl", repeat($._header_token), $.body),

		typeset_item: ($) =>
			seq(
				optional("pub"),
				"typeset",
				field("name", $.identifier),
				repeat($._header_token),
				$.body,
			),

		module_item: ($) =>
			seq(
				optional("pub"),
				"module",
				repeat($._header_token),
				choice($.body, ";"),
			),

		use_item: ($) => seq("use", repeat($._header_token), ";"),

		import_item: ($) =>
			seq(
				"import",
				field("name", $.string),
				repeat($._header_token),
				$.body,
			),

		export_item: ($) => seq("export", $.body),

		const_item: ($) =>
			seq(
				optional("pub"),
				"const",
				field("name", $.identifier),
				repeat($._tail_token),
				";",
			),

		global_item: ($) =>
			seq(
				optional("pub"),
				"global",
				optional("mut"),
				field("name", $.identifier),
				repeat($._tail_token),
				";",
			),

		memory_item: ($) =>
			seq("memory", field("name", $.identifier), repeat($._tail_token), ";"),

		body: ($) => seq("{", repeat($._any_token), "}"),

		// Header tokens: used for fn/struct/enum/trait/impl signatures, which
		// stop at the first bare `{` (the real body) or `;`. Excludes both, so
		// the repeat can't swallow its own terminator. `<`/`>` are handled via
		// `_angle_group` instead of bare PUNCT (see note above).
		_header_token: ($) =>
			choice(
				$._paren_group,
				$._bracket_group,
				$._angle_group,
				$.identifier,
				$.string,
				$.char,
				$.number,
				...PUNCT_NO_ANGLE,
			),

		// Matched `<...>` group, used only in header position. Its content
		// deliberately excludes bare `<`/`>` PUNCT (using `_angle_inner_token`,
		// not `_any_token`) — nesting (`Foo<Bar<T>>`) goes through a recursive
		// `_angle_group` instead, so there's no shift/reduce ambiguity between
		// "another `>` token" and "the group's own closing `>`".
		_angle_group: ($) => seq("<", repeat($._angle_inner_token), ">"),

		_angle_inner_token: ($) =>
			choice(
				$.body,
				$._paren_group,
				$._bracket_group,
				$._angle_group,
				$.identifier,
				$.string,
				$.char,
				$.number,
				...PUNCT_NO_ANGLE,
			),

		// Tail tokens: used for const/global/memory, which always end in a bare
		// `;` but may embed brace groups first (e.g. memory's `where { ... }`
		// clause). Excludes bare `;` so the repeat can't swallow its terminator,
		// but includes `body` since embedded brace groups are legal here.
		_tail_token: ($) =>
			choice(
				$.body,
				$._paren_group,
				$._bracket_group,
				$.identifier,
				$.string,
				$.char,
				$.number,
				...PUNCT,
			),

		// Any token: used inside a body/paren/bracket group's own content,
		// where the enclosing bracket is the unambiguous terminator, so `;` is
		// safe to include (statements inside a block are `;`-separated).
		_any_token: ($) =>
			choice(
				$.attribute,
				$.body,
				$._paren_group,
				$._bracket_group,
				$.identifier,
				$.string,
				$.char,
				$.number,
				";",
				...PUNCT,
			),

		_paren_group: ($) => seq("(", repeat($._any_token), ")"),
		_bracket_group: ($) => seq("[", repeat($._any_token), "]"),

		line_comment: ($) => token(seq("//", /.*/)),

		identifier: ($) => /[A-Za-z_][A-Za-z0-9_]*/,

		number: ($) =>
			token(
				choice(
					/0[xX][0-9a-fA-F][0-9a-fA-F_]*/,
					/0[bB][01][01_]*/,
					/\d[\d_]*\.\d[\d_]*/,
					/\d[\d_]*/,
				),
			),

		string: ($) => token(seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')),

		char: ($) => token(seq("'", repeat(choice(/[^'\\]/, /\\./)), "'")),
	},
});

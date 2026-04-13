// ── Tokenizer ─────────────────────────────────────────────────────────────

type TokenType = "kw" | "ty" | "fn" | "st" | "cm" | "nm" | "op" | "pp" | "va" | "plain";

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "return",
  "class", "struct", "public", "private", "protected",
  "using", "namespace", "new", "delete", "nullptr",
  "break", "continue", "case", "default", "switch",
  "const", "constexpr", "void", "auto", "true", "false",
  "this", "static", "inline", "template", "typename",
]);

const TYPES = new Set([
  "int", "double", "float", "string", "bool", "char",
  "long", "short", "unsigned", "size_t",
  "vector", "map", "set", "pair", "list", "array",
]);

const KNOWN_FUNCTIONS = new Set([
  "cout", "cin", "endl", "getline", "main",
  "sort", "reverse", "find", "min", "max",
  "sqrt", "pow", "abs", "floor", "ceil", "round", "log", "log10",
  "stoi", "stof", "stod", "to_string",
  "push_back", "pop_back", "size", "length", "empty", "clear",
  "front", "back", "begin", "end", "substr", "replace",
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const rest = code.slice(i);
    let m: RegExpMatchArray | null;

    // newline
    if (rest[0] === "\n") {
      tokens.push({ type: "plain", value: "\n" });
      i++;
      continue;
    }

    // horizontal whitespace
    m = rest.match(/^[ \t]+/);
    if (m) { tokens.push({ type: "plain", value: m[0] }); i += m[0].length; continue; }

    // line comment (// ...) and shell comment (# ...)
    m = rest.match(/^(\/\/|# ).*/);
    if (m) { tokens.push({ type: "cm", value: m[0] }); i += m[0].length; continue; }

    // preprocessor directive — greedily consume include path on same line
    m = rest.match(/^#\w+/);
    if (m) {
      tokens.push({ type: "pp", value: m[0] });
      i += m[0].length;
      const path = code.slice(i).match(/^( *)(<[^>\n]+>|"[^"\n]*")/);
      if (path) {
        if (path[1]) tokens.push({ type: "plain", value: path[1] });
        tokens.push({ type: "st", value: path[2] });
        i += path[0].length;
      }
      continue;
    }

    // string literal
    m = rest.match(/^"[^"\n]*"/);
    if (m) { tokens.push({ type: "st", value: m[0] }); i += m[0].length; continue; }

    // char literal
    m = rest.match(/^'[^'\n]*'/);
    if (m) { tokens.push({ type: "st", value: m[0] }); i += m[0].length; continue; }

    // number
    m = rest.match(/^\d+\.?\d*/);
    if (m) { tokens.push({ type: "nm", value: m[0] }); i += m[0].length; continue; }

    // identifier
    m = rest.match(/^[a-zA-Z_]\w*/);
    if (m) {
      const word = m[0];
      const followedByParen = /^\s*\(/.test(code.slice(i + word.length));
      let type: TokenType;

      if (KEYWORDS.has(word))                       type = "kw";
      else if (TYPES.has(word))                     type = "ty";
      else if (KNOWN_FUNCTIONS.has(word))           type = "fn";
      else if (followedByParen)                     type = "fn";
      else if (/^[A-Z]/.test(word))                type = "ty"; // PascalCase → user type
      else                                          type = "va";

      tokens.push({ type, value: word });
      i += word.length;
      continue;
    }

    // operators (greedy multi-char: <<, >>, !=, ==, <=, >=, &&, ||, ->, ++)
    m = rest.match(/^[+\-*/%=<>!&|^~?]+/);
    if (m) { tokens.push({ type: "op", value: m[0] }); i += m[0].length; continue; }

    // anything else (punctuation, braces, etc.)
    tokens.push({ type: "plain", value: rest[0] });
    i++;
  }

  return tokens;
}

// ── Token → style map ─────────────────────────────────────────────────────

const tokenClass: Record<TokenType, string> = {
  kw:    "text-[#569cd6]",
  ty:    "text-[#4ec9b0]",
  fn:    "text-[#dcdcaa]",
  st:    "text-[#ce9178]",
  cm:    "text-[#6a9955] italic",
  nm:    "text-[#b5cea8]",
  op:    "text-[#d4d4d4]",
  pp:    "text-[#c586c0]",
  va:    "text-[#9cdcfe]",
  plain: "",
};

// ── Component ─────────────────────────────────────────────────────────────

export default function CodeBlock({ code, clip }: { code: string; clip?: boolean }) {
  const tokens = tokenize(code);
  return (
    <>
      <style>{`
        .cb-pre::-webkit-scrollbar { height: 5px; background: var(--code-bg); }
        .cb-pre::-webkit-scrollbar-track { background: var(--code-bg); }
        .cb-pre::-webkit-scrollbar-thumb { background: rgba(0,212,255,.25); border-radius: 9999px; }
        .cb-pre::-webkit-scrollbar-thumb:hover { background: var(--accent); }
      `}</style>
      <pre className={`cb-pre bg-code-bg pl-4 pr-1 py-3.5 ${clip ? "overflow-x-clip" : "overflow-x-auto"} overflow-y-clip font-mono text-[12px] leading-[1.7] border-b border-border last:border-b-0`}>
        {tokens.map((token, i) =>
          token.type === "plain" ? (
            token.value
          ) : (
            <span key={i} className={tokenClass[token.type]}>
              {token.value}
            </span>
          )
        )}
      </pre>
    </>
  );
}

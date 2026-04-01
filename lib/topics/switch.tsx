import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_basics = `\
switch (expression) {   // expression must be integral or enum
  case 1:
    doOne();
    break;              // ← required to stop fall-through
  case 2:
  case 3:               // grouping: same body for 2 and 3
    doTwoOrThree();
    break;
  default:              // optional; runs if no case matches
    doDefault();
}

// ── What switch can match ────────────────────────────────────
// ✅ int, char, short, long, long long (and unsigned variants)
// ✅ enum, enum class
// ✅ constexpr variables used as case labels
// ❌ std::string  ❌ float / double  ❌ std::vector
// (use if/else or a map for those)

// ── Case labels must be compile-time constants ───────────────
constexpr int TIMEOUT = 408;
switch (code) {
  case 200: return "OK";
  case 404: return "Not Found";
  case TIMEOUT: return "Timeout";  // ✅ constexpr is fine
}`;

const c_fallthrough = `\
// Fall-through: execution continues into the next case
// when there is no break (or return/throw/continue)

switch (state) {
  case INIT:
    initialize();
    [[fallthrough]];      // ✅ C++17: explicit intent, no warning
  case RUNNING:
    tick();
    break;
  case PAUSED:
    // empty case — falls through silently (common pattern)
  case STOPPED:
    cleanup();
    break;
}

// ⚠ Implicit fall-through (no [[fallthrough]]) triggers
// -Wimplicit-fallthrough warning with -Wall
// Always annotate intentional fall-through with [[fallthrough]]

// return and throw also stop fall-through:
switch (err) {
  case 0:  return "ok";
  case -1: throw std::runtime_error("fatal");
  default: return "unknown";
}`;

const c_init = `\
// switch with initializer (C++17) — same as if with initializer
switch (auto status = getStatus(); status) {
  case Status::OK:
    handle(status);
    break;
  case Status::Error:
    recover(status);
    break;
}
// status is destroyed after the switch block

// ── Declarations inside switch ───────────────────────────────
switch (x) {
  case 1:
    int n = 10;    // ❌ jumps over initialization — compile error
    use(n);
    break;
  case 2:
    use(n);        // would use uninitialized n
}

// Fix: wrap in braces to scope the variable
switch (x) {
  case 1: {
    int n = 10;    // ✅ scoped to this case only
    use(n);
    break;
  }
  case 2:
    break;
}`;

const c_enum = `\
enum class Color { Red, Green, Blue };

Color c = Color::Green;

switch (c) {
  case Color::Red:   std::cout << "red\\n";   break;
  case Color::Green: std::cout << "green\\n"; break;
  case Color::Blue:  std::cout << "blue\\n";  break;
  // No default — compiler warns if a Color value is unhandled
  // (-Wswitch with GCC/Clang)
}

// ── Why omit default with enum class? ───────────────────────
// If you add a new enumerator later, -Wswitch will flag every
// switch that doesn't handle it — a free exhaustiveness check.
// Adding default silences the warning and hides the gap.

// ── scoped enum (enum class) vs unscoped enum ────────────────
enum Unscoped { A, B };     // A, B leak into surrounding scope
enum class Scoped { A, B }; // must write Scoped::A — no leakage
int x = A;                  // ✅ unscoped converts to int
// int y = Scoped::A;       // ❌ no implicit conversion`;

const c_vs_map = `\
// When switch is the wrong tool — use a map or array instead

// ❌ Switch with 50+ cases for a lookup table is painful to maintain
// ✅ Use std::unordered_map for string keys or non-contiguous ints

std::unordered_map<std::string, int> opcode = {
  {"add", 0x01}, {"sub", 0x02}, {"mul", 0x03},
};
int code = opcode.count(name) ? opcode[name] : -1;

// ✅ Use a function pointer / std::function table for dispatch
using Handler = std::function<void()>;
std::array<Handler, 4> handlers = {
  []{ handleA(); },
  []{ handleB(); },
  []{ handleC(); },
  []{ handleD(); },
};
if (idx < handlers.size()) handlers[idx]();

// ── When to prefer switch over if/else chain ─────────────────
// switch: integral/enum, many cases, readable case grouping
// if/else: strings, ranges (x > 10 && x < 20), complex conditions`;

// ── Page component ──────────────────────────────────────────────────────────

export default function SwitchPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Switch Statement" num="01" color="orange" size="lg">
          <Prose>
            <H3>How switch works</H3>
            <P>
              <Code>switch</Code> evaluates an integral or enum expression once, then jumps directly
              to the matching <Code>case</Code> label — no sequential testing like <Code>if/else if</Code>.
              This makes it O(1) and often compiles to a jump table or binary search, faster than a
              long chain of equality checks.
            </P>
            <Grid>
              <Cell>
                <H3>Rules</H3>
                <OL>
                  <LI>Expression must be integral type or <Code>enum</Code> — not <Code>string</Code>, <Code>float</Code>, or objects.</LI>
                  <LI>Case labels must be compile-time constant expressions.</LI>
                  <LI>Each case falls through to the next unless you use <Code>break</Code>, <Code>return</Code>, or <Code>throw</Code>.</LI>
                  <LI><Code>default</Code> is optional but recommended — it catches unhandled values.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Common patterns</H3>
                <OL>
                  <LI>Group cases with no body between them — they share the next body.</LI>
                  <LI>Use <Code>[[fallthrough]]</Code> (C++17) to mark intentional fall-through.</LI>
                  <LI>Wrap case bodies in <Code>{"{}"}</Code> when you need to declare variables.</LI>
                  <LI>Omit <Code>default</Code> when switching on <Code>enum class</Code> to get exhaustiveness warnings.</LI>
                </OL>
                <Note>The compiler may generate a jump table when cases are dense integers, or a binary search for sparse values — both beat a linear if/else chain.</Note>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_basics} />
        </Card>

        {/* 02 Fall-through */}
        <Card title="Fall-Through & [[fallthrough]]" num="02" color="orange" size="md">
          <CodeBlock code={c_fallthrough} />
          <InfoTable rows={[
            { key: "break",             value: "Exits the switch immediately. Required after every case body unless you want fall-through." },
            { key: "[[fallthrough]]",   value: "C++17 attribute. Marks intentional fall-through — suppresses -Wimplicit-fallthrough warning." },
            { key: "return / throw",    value: "Also stop fall-through. Common in switch-based state machines and error handlers." },
            { key: "empty case",        value: "A case with no body before the next case silently falls through — no warning needed." },
          ]} />
          <Tip color="orange">
            <strong>Compile with <code>-Wimplicit-fallthrough</code>.</strong> It catches every unintentional fall-through. Mark the intentional ones with <code>[[fallthrough]]</code> to keep the warning clean.
          </Tip>
        </Card>

        {/* 03 Initializer & Declarations */}
        <Card title="Initializer & Variable Declarations" num="03" color="orange" size="md">
          <CodeBlock code={c_init} />
          <InfoTable rows={[
            { key: "switch (init; expr)", value: "C++17: scopes a variable to the entire switch block. Same syntax as if with initializer." },
            { key: "int n = x in case",   value: "Declaring a variable in a case without braces is ill-formed if control can jump over the initialization." },
            { key: "case { ... }",        value: "Braces create a new scope — variables declared inside are destroyed at the closing brace." },
          ]} />
          <Tip color="orange">
            <strong>Always brace case bodies that declare variables.</strong> Jumping over a variable initialization is a compile error in C++ — the compiler will reject it, but adding braces is the clean fix.
          </Tip>
        </Card>

        {/* 04 Enums */}
        <Card title="Switching on enum class" num="04" color="orange" size="md">
          <CodeBlock code={c_enum} />
          <InfoTable rows={[
            { key: "enum class",     value: "Scoped enum — values don't leak into the outer scope. No implicit conversion to int." },
            { key: "enum (plain)",   value: "Unscoped — values are in the surrounding scope. Implicitly converts to int." },
            { key: "-Wswitch",       value: "Warns when an enumerator is not handled by any case. Only fires when there's no default." },
            { key: "no default",     value: "Intentionally omitting default on enum class switches turns the compiler into an exhaustiveness checker." },
          ]} />
        </Card>

        {/* 05 switch vs alternatives */}
        <Card title="switch vs Map vs if/else" num="05" color="orange" size="md">
          <CodeBlock code={c_vs_map} />
          <InfoTable rows={[
            { key: "switch",            value: "Best for integral/enum with a fixed, known set of values. Compiler can optimize to a jump table." },
            { key: "if/else chain",     value: "Needed for ranges, string comparisons, or complex conditions. Sequential — O(n) in the worst case." },
            { key: "unordered_map",     value: "Best for string keys or large sparse integer sets. O(1) average lookup, but heap allocation overhead." },
            { key: "function table",    value: "Array of function pointers or lambdas indexed by integer. O(1), no branching, highly cache-friendly." },
          ]} />
          <Tip color="orange">
            <strong>Prefer switch for small, dense integer/enum dispatch.</strong> For string-keyed dispatch or 50+ cases, a <code>std::unordered_map</code> or function table is more maintainable and just as fast.
          </Tip>
        </Card>

      </div>
    </>
  );
}

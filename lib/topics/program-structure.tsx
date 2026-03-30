import Link from "next/link";
import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";

// ── Code strings ───────────────────────────────────────────────────────────

const c_phases = `\
// 8 Phases of Translation (ISO C++23 §5.2)
// 1. Character mapping (universal-character-names)
// 2. Line splicing (backslash + newline → single logical line)
// 3. Tokenization (produces preprocessing tokens)
// 4. Preprocessing (#include, macros, #if/#endif)
// 5. Character-set conversion (string / char literals)
// 6. String literal concatenation  ("a" "b" → "ab")
// 7. Translation (compilation proper → object file)
// 8. Linking (resolves external references → executable)

// Each .cpp file is ONE Translation Unit (TU).
// Phase 4 pastes every #included header inline into the TU,
// so the compiler never sees the header directly.`;

const c_linkage = `\
// ── External linkage — visible to ALL translation units ──
int   globalVar    = 42;       // external by default
void  globalFunc() {}          // external by default
extern int declaredElsewhere;  // declaration (no storage)

// ── Internal linkage — THIS translation unit only ──────
static int fileLocal = 10;      // C-style; works but avoid

namespace {                     // preferred modern idiom
  constexpr int MAGIC = 0xDEAD; // invisible to other TUs
  void privateHelper() {}
}

// ── No linkage — purely local ──────────────────────────
void foo() {
  int x = 5;        // no linkage; no address across TUs
  typedef int T;    // no linkage
  class Local {};   // no linkage (local class)
}

// Rule of thumb:
// Free vars/funcs in a .cpp → prefer anonymous namespace
// over 'static' (static has other meanings in class scope)`;

const c_odr = `\
// One Definition Rule: each entity defined EXACTLY once
// across the entire program (with exceptions).

// ❌ VIOLATION — variable definition in a shared header
// header.h:
int counter = 0;   // two TUs include → duplicate symbol

// ✅ FIX 1: constexpr (implies inline since C++17)
constexpr int MAX = 100;   // no ODR violation in headers

// ✅ FIX 2: inline variable (C++17)
inline int counter = 0;    // single logical def, safe in headers

// ✅ FIX 3: extern + one definition
// header.h:  extern int counter;
// one .cpp:  int counter = 0;

// ODR-use: "using" a variable in a context that requires its address
constexpr int N = 5;
int arr[N];   // NOT ODR-used (value only, no address needed)
const int* p = &N;  // ODR-used → a definition of N is required

// Functions: templates and inline functions may be defined
// in multiple TUs, but all definitions must be IDENTICAL.`;

const c_inline_var = `\
// ── C++17: inline static data members ──────────────────
// Pre-C++17: out-of-line definition required in exactly one .cpp

// ❌ Pre-C++17 — definition must live in impl.cpp
struct Config {
  static int counter;           // declaration in header
};
// impl.cpp: int Config::counter = 0;   (required)

// ✅ C++17 — definition lives in the header
struct Config {
  inline static int counter  = 0;           // definition
  static inline constexpr int MAX = 256;    // common idiom
  inline static const std::string name = "cfg";
};

// Namespace scope (header-only libraries)
inline int g_requestCount = 0;   // ODR-safe across TUs

// constexpr variables are IMPLICITLY inline since C++17
constexpr double TAU = 6.28318530718;  // safe in any header

// Important: inline means "may appear in multiple TUs" —
// it does NOT mean "always inlined by the optimizer".`;

const c_namespaces = `\
// ── C++17: nested namespace shorthand ─────────────────
namespace App::Core::Util {
  void helper() {}
}
// Equivalent pre-C++17:
// namespace App { namespace Core { namespace Util { ... }}}

// ── Anonymous namespace → internal linkage ─────────────
namespace {
  int magic = 0xDEAD;        // invisible outside this TU
  void localImpl() {}
}

// ── Inline namespace (ABI versioning) ──────────────────
namespace api {
  inline namespace v2 {           // default version
    struct Result { int code; };  // api::Result → v2::Result
  }
  namespace v1 {
    struct Result { bool ok; };   // api::v1::Result (legacy)
  }
}
api::Result r{0};            // resolves to api::v2::Result

// ── using-declaration vs using-directive ───────────────
using std::cout;             // precise: imports one name
using namespace std;         // broad: avoid in headers!

// ── Namespace aliases ───────────────────────────────────
namespace fs = std::filesystem;   // less typing`;

const c_if_constexpr = `\
#include <type_traits>

template<typename T>
std::string describe(T val) {
  if constexpr (std::is_integral_v<T>) {
    // Only compiled when T is an integer type
    return "int:" + std::to_string(val);
  } else if constexpr (std::is_floating_point_v<T>) {
    return "float:" + std::to_string(val);
  } else if constexpr (std::is_same_v<T, std::string>) {
    return "str:" + val;
  } else {
    // Parsed but NOT instantiated — static_assert OK here
    static_assert(always_false<T>, "Unsupported type");
  }
}

// Helper to defer static_assert evaluation
template<typename> inline constexpr bool always_false = false;

// ── Why it matters ──────────────────────────────────────
// Regular if: BOTH branches compile for every T (often fails)
// if constexpr: only the matching branch is instantiated

// std::is_integral_v<T> is shorthand for
// std::is_integral<T>::value   (C++17 variable template)`;

const c_bindings = `\
// Structured bindings (C++17) decompose any aggregate/tuple-like

// std::pair and std::tuple
auto [key, val] = std::make_pair("pi", 3.14159);
auto [x, y, z]  = std::make_tuple(1, 2.0f, "hi");

// Aggregate struct (binds in declaration order)
struct Pixel { uint8_t r, g, b, a; };
auto [r, g, b, a] = Pixel{255, 128, 0, 255};

// C-style array
int rgb[3] = {255, 0, 128};
auto& [red, green, blue] = rgb;   // & → modifies original

// Map iteration — most common real-world use
std::map<std::string, int> freq;
for (auto& [word, count] : freq) {
  count++;   // modifies map in-place
}

// const binding (both bindings are const)
const auto [lo, hi] = std::make_pair(0, 100);

// Bindings to bit-fields NOT allowed (can't take address)
// Customization: implement get<N>(), tuple_size, tuple_element`;

const c_attributes = `\
// ── [[nodiscard]] ──────────────────────────────────────
[[nodiscard]] int openFile(const char* path);
openFile("x.txt");   // ⚠ warning: ignoring return value

// With message (C++20, widely supported in C++17 compilers)
[[nodiscard("check the error code")]] int writeData();

// Applied to a type: every function returning it is nodiscard
struct [[nodiscard]] Error { int code; };

// ── [[maybe_unused]] ───────────────────────────────────
[[maybe_unused]] static void debugDump(int v) {}  // no warning
void setup([[maybe_unused]] int flags) {}   // suppress param warn

// ── [[deprecated]] ─────────────────────────────────────
[[deprecated("use newApi() instead — see docs")]]
void legacyApi() {}

[[deprecated]] class OldConfig {};          // on types too

// ── [[fallthrough]] ────────────────────────────────────
switch (state) {
  case INIT:
    setup();
    [[fallthrough]];    // explicit intent → no Wimplicit-fallthrough
  case RUNNING:
    tick();
    break;
}

// ── [[likely]] / [[unlikely]] (C++20) ─────────────────
if ([[likely]] (ptr != nullptr)) { /* fast path */ }`;

const c_static_init = `\
// Static Initialization Order Fiasco (SIOF):
// Globals in different TUs may initialize in any order.

// file a.cpp
int Registry::count = 0;          // initialized… when?

// file b.cpp (may run before a.cpp)
extern int Registry::count;
int Derived::extra = Registry::count + 1;  // ⚠ possibly 0

// ── Solution 1: Meyers Singleton (function-local static) ──
int& getCount() {
  static int count = 0;   // initialized on first call (C++11: thread-safe)
  return count;
}
int& getRegistry() {
  static Registry r;  // r init guaranteed before first use
  return r;
}

// ── Solution 2: constexpr globals (zero-init phase) ───
constexpr int MAX_THREADS = 16;  // constant initialization — before any
                                  // dynamic init, safe everywhere

// ── Solution 3: constinit (C++20) ─────────────────────
// constinit int limit = computeLimit();  // error if not constexpr`;

const c_main = `\
// All valid main() signatures per ISO C++
int main() {}
int main(int argc, char*  argv[]) {}
int main(int argc, char** argv)   {}   // equivalent

// argc — count of arguments INCLUDING program name (≥1)
// argv[0] — program name/path (implementation-defined)
// argv[argc] == nullptr  (guaranteed by the standard)
// argv[1..argc-1] — command-line arguments

// Return value
#include <cstdlib>
return EXIT_SUCCESS;   // expands to 0
return EXIT_FAILURE;   // expands to 1 (non-zero)
return 42;             // any non-zero = failure by convention

// Implicit return 0 (C++11, ONLY for main)
int main() { }    // well-defined: equivalent to return 0;

// Cleanup hooks
std::atexit([]{ flushLogs(); });      // runs on normal exit
std::at_quick_exit([]{ /* ... */ });  // runs on std::quick_exit()

// Environment (implementation-defined)
#include <cstdlib>
if (const char* p = std::getenv("HOME")) { /* use p */ }`;

const c_constexpr = `\
// const — immutable after init; may be runtime value
const int a = rand();         // runtime const — OK
const int b = 42;             // compile-time eligible

// constexpr — MUST be evaluatable at compile time
constexpr int MAX = 1024;
constexpr int square(int x) { return x * x; }  // C++11

constexpr int S = square(5);     // 25, computed at compile time
int n = square(rand());           // computed at runtime (non-constexpr arg)

// C++17 constexpr improvements
// ✅ constexpr lambdas
auto clamp = [](auto v, auto lo, auto hi) constexpr {
  return v < lo ? lo : (v > hi ? hi : v);
};

// ✅ constexpr if (see if constexpr card)
// ✅ constexpr variables are implicitly inline at namespace scope

// Key distinctions
// const:      immutable reference; address CAN be taken
// constexpr:  guaranteed compile-time; address can still be taken
// inline:     ODR exception; safe in multiple TUs
// constexpr implies const (for variables)
// constexpr implies inline (for namespace-scope variables, C++17)`;

const c_byte = `\
#include <cstddef>   // std::byte

// std::byte: opaque representation of a raw byte
// NO arithmetic — only bitwise operations defined
std::byte b{0xFF};
std::byte mask{0x0F};

std::byte r1 = b & mask;      // AND  → 0x0F
std::byte r2 = b | mask;      // OR   → 0xFF
std::byte r3 = b ^ mask;      // XOR  → 0xF0
std::byte r4 = ~b;            // NOT  → 0x00
std::byte r5 = b << 2;        // left shift
std::byte r6 = b >> 1;        // right shift

// Explicit conversions required
int val = std::to_integer<int>(b);   // → 255
std::byte c = static_cast<std::byte>(42);

// Why not char or uint8_t?
// char:    may be signed; aliasing rules differ
// uint8_t: arithmetic operators defined — accidents compile silently
//   e.g., uint8_t x = 200; x + 100 overflows silently
// std::byte: b + 1 is a COMPILE ERROR → bugs surface early`;

const c_flags = `\
# ── C++17 strict compilation ─────────────────────────
g++ -std=c++17 -Wall -Wextra -Wpedantic -Werror

# -Wall     core warnings (unused vars, shadowing, …)
# -Wextra   extra diagnostics on top of -Wall
# -Wpedantic  reject non-conforming extensions
# -Werror   treat all warnings as errors

# ── Optimization levels ───────────────────────────────
-O0    # no optimization — fastest compile, best debug
-O1    # basic (constant folding, inlining, …)
-O2    # moderate — standard for release builds
-O3    # aggressive — may increase binary size
-Os    # minimize binary size (O2 minus size-increasing opts)
-Og    # debug-friendly optimization (GCC; better than -O0)

# ── Debug symbols ─────────────────────────────────────
-g       # standard DWARF info (gdb/lldb)
-ggdb    # GDB-specific extensions (richer backtraces)

# ── Runtime sanitizers (use with -O1 or lower) ────────
-fsanitize=address     # buffer OOB, use-after-free, leaks
-fsanitize=undefined   # signed overflow, null deref, misalign
-fsanitize=thread      # data races
-fsanitize=memory      # uninitialized reads (Clang only)

# ── Recommended dev build ─────────────────────────────
g++ -std=c++17 -O1 -g -fsanitize=address,undefined \\
    -Wall -Wextra -Werror main.cpp -o app`;

// ── Page component ─────────────────────────────────────────────────────────

export default function ProgramStructurePage() {
  return (
    <>
      {/* Back nav */}
      <div className="max-w-[1400px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[3px] uppercase text-muted hover:text-accent transition-colors mb-6"
        >
          ← Back to Cheat Sheet
        </Link>
      </div>

      {/* Topic header */}
      <div
        className="text-center mb-8 px-5 py-8 bg-surface border border-border relative overflow-hidden max-w-[1400px] mx-auto"
        style={{ borderTopColor: "var(--accent)", borderTopWidth: "3px" }}
      >
        <div className="absolute -top-[60px] -left-[60px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(0,212,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-[60px] -right-[60px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none" />
        <span className="inline-block mb-2 font-mono text-[10px] tracking-[3px] uppercase text-muted opacity-50">
          Topic 01
        </span>
        <h1 className="font-heading text-[clamp(2rem,5vw,3.5rem)] tracking-[4px] text-accent leading-none [text-shadow:0_0_30px_rgba(0,212,255,0.4)]">
          Program Structure
        </h1>
        <p className="text-muted text-[13px] mt-2 tracking-[3px] uppercase font-light">
          Translation Units · Linkage · ODR · C++17 Features
        </p>
        <span className="inline-block mt-3 px-3.5 py-1 border border-accent3 text-accent3 text-[11px] tracking-[2px] uppercase">
          C++17 · Advanced Reference
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 max-w-[1400px] mx-auto">

        {/* 01 Translation Units & Phases */}
        <Card title="Translation Units & Compilation Phases" num="01" color="cyan" wide>
          <SectionLabel>8 Phases of Translation (ISO C++)</SectionLabel>
          <CodeBlock code={c_phases} />
          <Tip color="cyan">
            <strong>Key insight:</strong> The compiler processes one TU at a time. Multiple <code>.cpp</code> files are compiled independently, then linked. Headers are not separately compiled — they are copy-pasted into each TU at phase 4.
          </Tip>
        </Card>

        {/* 02 Linkage */}
        <Card title="Linkage: External · Internal · None" num="02" color="orange" wide>
          <CodeBlock code={c_linkage} />
          <InfoTable rows={[
            { key: "External", value: "Default for free functions and global vars — visible to all TUs" },
            { key: "Internal", value: "Anonymous namespace or static (file-scope) — this TU only" },
            { key: "No linkage", value: "Local variables, typedefs, local classes — purely local" },
          ]} />
        </Card>

        {/* 03 ODR */}
        <Card title="One Definition Rule (ODR)" num="03" color="purple">
          <CodeBlock code={c_odr} />
          <Tip color="purple">
            <strong>ODR exceptions:</strong> <code>inline</code> functions/variables, templates, and <code>constexpr</code> can be defined in multiple TUs as long as all definitions are identical. The linker picks one.
          </Tip>
        </Card>

        {/* 04 Inline Variables */}
        <Card title="Inline Variables (C++17)" num="04" color="green">
          <CodeBlock code={c_inline_var} />
          <Tip color="green">
            <strong>Header-only libs:</strong> <code>inline</code> variables made true header-only libraries practical in C++17 — no more mandatory <code>.cpp</code> file just for static member definitions.
          </Tip>
        </Card>

        {/* 05 Namespaces */}
        <Card title="Namespaces" num="05" color="cyan" wide>
          <CodeBlock code={c_namespaces} />
          <InfoTable rows={[
            { key: "namespace A::B::C", value: "C++17 shorthand for triply-nested namespaces" },
            { key: "namespace { }", value: "Anonymous — gives internal linkage to all enclosed names" },
            { key: "inline namespace", value: "Enables ADL through parent; used for ABI versioning" },
            { key: "using std::X", value: "Import one name — safe even in headers (with care)" },
            { key: "using namespace", value: "Import all — never in headers, pollutes all includers" },
          ]} />
        </Card>

        {/* 06 if constexpr */}
        <Card title="if constexpr (C++17)" num="06" color="orange">
          <CodeBlock code={c_if_constexpr} />
          <Tip color="orange">
            <strong>Template specialization lite:</strong> <code>if constexpr</code> eliminates the need for many partial template specializations and SFINAE tricks. The discarded branch is parsed but not instantiated — syntax must be valid but type errors don&apos;t fire.
          </Tip>
        </Card>

        {/* 07 Structured Bindings */}
        <Card title="Structured Bindings (C++17)" num="07" color="purple">
          <CodeBlock code={c_bindings} />
          <Tip color="purple">
            <strong>Customization point:</strong> Any type can support structured bindings by specializing <code>std::tuple_size</code>, <code>std::tuple_element</code>, and providing a <code>get&lt;N&gt;()</code> overload — the same protocol used by <code>std::tuple</code>.
          </Tip>
        </Card>

        {/* 08 Attributes */}
        <Card title="C++17 Attributes" num="08" color="yellow" wide>
          <CodeBlock code={c_attributes} />
          <InfoTable rows={[
            { key: "[[nodiscard]]",     value: "Warn when caller discards the return value. Apply to error codes, resource handles, expensive computations." },
            { key: "[[maybe_unused]]",  value: "Suppress -Wunused-* for variables, parameters, or functions that are intentionally unused in some build configs." },
            { key: "[[deprecated]]",    value: "Emit a compiler diagnostic at call sites. Provide migration guidance in the message string." },
            { key: "[[fallthrough]]",   value: "Silences -Wimplicit-fallthrough inside switch statements. Must appear as a statement on its own line." },
          ]} />
        </Card>

        {/* 09 Static Init Fiasco */}
        <Card title="Static Initialization Order Fiasco" num="09" color="red">
          <CodeBlock code={c_static_init} />
          <Tip color="red">
            <strong>Rule of thumb:</strong> Never let a global variable depend on another global defined in a different <code>.cpp</code> file. Use function-local statics (Meyers Singleton) or <code>constexpr</code> to guarantee initialization order.
          </Tip>
        </Card>

        {/* 10 main() */}
        <Card title="main() Contract" num="10" color="green">
          <CodeBlock code={c_main} />
          <Tip color="green">
            <strong>main() is special:</strong> It is the only function with an implicit <code>return 0</code>, the only function where <code>int</code> can be the return type without a <code>return</code> statement, and the only user-defined function that may not be called or its address taken.
          </Tip>
        </Card>

        {/* 11 const vs constexpr */}
        <Card title="const vs constexpr" num="11" color="cyan" wide>
          <CodeBlock code={c_constexpr} />
          <InfoTable rows={[
            { key: "const",       value: "Value won't change after init. May be runtime (e.g. const int n = argc). Address can be taken." },
            { key: "constexpr",   value: "Must be evaluatable at compile time. Implies const. Enables use in template args, array sizes, case labels." },
            { key: "constexpr fn", value: "C++17 relaxed rules: can contain loops, local vars, if/switch. Evaluated at compile time if all args are constexpr." },
            { key: "C++17 bonus", value: "constexpr implies inline for namespace-scope variables — safe to define in headers without ODR violation." },
          ]} />
        </Card>

        {/* 12 std::byte */}
        <Card title="std::byte (C++17)" num="12" color="purple">
          <CodeBlock code={c_byte} />
          <Tip color="purple">
            <strong>Use when:</strong> working with raw buffers, serialization, memory-mapped I/O, or network packets. <code>std::byte</code> communicates intent and prevents accidental arithmetic on raw bytes.
          </Tip>
        </Card>

        {/* 13 Compiler Flags */}
        <Card title="Compiler Flags & Sanitizers" num="13" color="orange" wide>
          <CodeBlock code={c_flags} />
          <Tip color="orange">
            <strong>Sanitizer overhead:</strong> AddressSanitizer adds ~2× runtime overhead; UBSanitizer adds ~1.5×. Use in CI and during development. Never ship with sanitizers enabled — they require the sanitizer runtime to be present.
          </Tip>
        </Card>

      </div>
    </>
  );
}

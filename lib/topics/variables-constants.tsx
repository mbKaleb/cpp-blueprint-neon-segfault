import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_storage = `\
// ── Automatic storage (stack) — destroyed when scope ends ──
void foo() {
  int x = 10;          // created on entry, destroyed on exit
  {
    int y = 20;        // y destroyed here ↓
  }                    // ← y's lifetime ends
}

// ── Static storage — lives for entire program duration ──────
static int fileCounter = 0;     // internal linkage (file-scope)
int globalCount = 0;            // external linkage

void bar() {
  static int callCount = 0;     // initialized once, persists across calls
  callCount++;
}

// ── Thread-local storage (C++11) ────────────────────────────
thread_local int threadId = 0;  // each thread gets its own copy

// ── Dynamic storage (heap) — manual or RAII lifetime ────────
int* p = new int(42);           // you control the lifetime
delete p;                        // must free manually
// Prefer: std::unique_ptr<int> p = std::make_unique<int>(42);`;

const c_init = `\
// ── Zero-initialization (before any other init) ─────────────
// Globals and static locals are zero-initialized automatically
int g;          // g == 0 (guaranteed)
static int s;   // s == 0 (guaranteed)

// ── Default-initialization ───────────────────────────────────
int x;          // ❌ indeterminate (local, non-class) — garbage!
std::string s;  // ✅ default-constructed — empty string

// ── Value-initialization (with empty {}) ────────────────────
int a{};        // 0
double b{};     // 0.0
int* p{};       // nullptr
int arr[5]{};   // {0,0,0,0,0}

// ── Direct / copy initialization ────────────────────────────
int i  = 5;     // copy-initialization
int j(5);       // direct-initialization
int k{5};       // direct-list-initialization (C++11) ← prefer
                // Brace init PREVENTS narrowing:
int n{3.9};     // ❌ error — narrowing double→int not allowed
int m = 3.9;    // ✅ compiles (silently truncates to 3)`;

const c_scope = `\
int x = 1;               // file scope (global)

namespace Demo {
  int x = 2;             // namespace scope
}

void func() {
  int x = 3;             // local scope — shadows global
  {
    int x = 4;           // inner block — shadows outer local
    std::cout << x;      // 4
  }
  std::cout << x;        // 3
  std::cout << ::x;      // 1 — :: accesses global scope
  std::cout << Demo::x;  // 2
}

// Name lookup order:
// 1. Current block  →  2. Enclosing blocks  →  3. Namespace  →  4. Global`;

const c_const = `\
// const — immutable after initialization; value may be runtime
const int port = 8080;
const int limit = getEnvLimit();    // runtime const — OK

// constexpr — must be compile-time; enables use as template arg
constexpr int CACHE_SIZE = 1024;
constexpr double PI = 3.14159265358979;

int arr[CACHE_SIZE];                // ✅ valid array size
template<int N> struct Buffer {};
Buffer<CACHE_SIZE> buf;             // ✅ valid template arg

// constexpr function — evaluated at compile time if possible
constexpr int square(int n) { return n * n; }
constexpr int S = square(8);        // 64 — compile time
int s2 = square(rand());            // runtime — also fine

// constinit (C++20) — must init at compile time, but not const
constinit int g_flags = 0;          // compile-time init, mutable
g_flags = 1;                        // ✅ allowed (not const)
// constinit int bad = getFlags();  // ❌ runtime init — compile error`;

const c_volatile = `\
// volatile tells the compiler: don't optimize away reads/writes
// Used for memory-mapped hardware registers or signal handlers

volatile int* statusReg = reinterpret_cast<volatile int*>(0xDEAD0);
int val = *statusReg;   // read is NOT cached — always hits memory
*statusReg = 1;         // write is NOT reordered or elided

// Common use in embedded / systems code:
volatile bool interruptFlag = false;

void interruptHandler() {
  interruptFlag = true;   // without volatile, optimizer may remove this
}

void loop() {
  while (!interruptFlag) { /* spin */ }  // must re-read each iteration
}

// ⚠ volatile does NOT make code thread-safe.
// Use std::atomic<> for inter-thread communication.`;

const c_structured = `\
// Structured bindings (C++17) — name elements of aggregate/pair/tuple

// std::pair
auto [host, port] = std::make_pair("localhost", 8080);

// Struct (binds in declaration order)
struct Point { double x, y, z; };
Point p{1.0, 2.0, 3.0};
auto [px, py, pz] = p;

// std::map / std::unordered_map iteration
std::map<std::string, int> scores;
for (auto& [name, score] : scores) {
  score += 10;   // modifies map in-place (ref binding)
}

// const binding — both names become const
const auto [lo, hi] = std::make_pair(0, 100);

// std::array / C-array
int rgb[3] = {255, 128, 0};
auto [r, g, b] = rgb;   // copies; use auto& to avoid copy`;

// ── Page component ──────────────────────────────────────────────────────────

export default function VariablesConstantsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Storage Duration */}
        <Card title="Storage Duration" num="01" color="purple" size="lg">
          <Prose>
            <H3>Four storage durations in C++</H3>
            <P>
              Every variable has a <Code>storage duration</Code> that determines when its memory is
              allocated and released. This is separate from <Code>scope</Code> (where the name is
              visible) — a <Code>static</Code> local has local scope but static duration.
            </P>
            <Grid>
              <Cell>
                <H3>Durations</H3>
                <OL>
                  <LI><Code>automatic</Code> — stack; created on block entry, destroyed on exit. Default for locals.</LI>
                  <LI><Code>static</Code> — lives for the entire program. Globals and <Code>static</Code> locals.</LI>
                  <LI><Code>thread_local</Code> — one instance per thread; lifetime matches the thread.</LI>
                  <LI><Code>dynamic</Code> — heap; you control lifetime with <Code>new</Code> / <Code>delete</Code> (or RAII).</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Key rules</H3>
                <OL>
                  <LI>Globals and <Code>static</Code> locals are zero-initialized before any other init runs.</LI>
                  <LI><Code>static</Code> local variables are initialized exactly once — on first call (C++11: thread-safe).</LI>
                  <LI><Code>thread_local</Code> can be combined with <Code>static</Code> or <Code>extern</Code>.</LI>
                  <LI>Prefer <Code>unique_ptr</Code> / <Code>shared_ptr</Code> over raw <Code>new</Code> for dynamic storage.</LI>
                </OL>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_storage} />
        </Card>

        {/* 02 Initialization */}
        <Card title="Initialization Forms" num="02" color="purple" size="md">
          <CodeBlock code={c_init} />
          <InfoTable rows={[
            { key: "int x;",      value: "Default-init — local non-class types are indeterminate (garbage). Always initialize locals." },
            { key: "int x{};",    value: "Value-init — zero for scalars, default-construct for classes. Prevents garbage." },
            { key: "int x{5};",   value: "Direct-list-init (brace init). Preferred — prevents narrowing conversions at compile time." },
            { key: "int x = 5;",  value: "Copy-init — fine for simple types but allows narrowing silently." },
            { key: "int x(5);",   value: "Direct-init — same as copy-init for scalars; can call explicit constructors." },
          ]} />
          <Tip color="purple">
            <strong>Prefer brace init <code>{"{}"}</code> everywhere.</strong> It is the only form that makes narrowing conversions a compile error, and it works uniformly across scalars, aggregates, and containers.
          </Tip>
        </Card>

        {/* 03 Scope */}
        <Card title="Scope & Name Lookup" num="03" color="purple" size="md">
          <CodeBlock code={c_scope} />
          <InfoTable rows={[
            { key: "Block scope",      value: "Variable declared inside { }. Destroyed at closing brace." },
            { key: "Namespace scope",  value: "Declared outside all functions/classes. Lives until program ends." },
            { key: "Class scope",      value: "Members — accessible via object, pointer, or (static) class name." },
            { key: "::x",             value: "Global scope operator — bypasses local shadowing to reach file-scope name." },
          ]} />
          <Tip color="purple">
            <strong>Avoid shadowing.</strong> Enable <code>-Wshadow</code> to catch variables that silently hide outer names — a common source of subtle bugs.
          </Tip>
        </Card>

        {/* 04 const & constexpr */}
        <Card title="const · constexpr · constinit" num="04" color="purple" size="md">
          <CodeBlock code={c_const} />
          <InfoTable rows={[
            { key: "const",      value: "Immutable after init. Value may come from runtime. Cannot use as template arg or array size." },
            { key: "constexpr",  value: "Must evaluate at compile time. Implies const. Usable as template arg, array size, case label." },
            { key: "constinit",  value: "C++20: guarantees compile-time initialization but the variable stays mutable. Prevents SIOF." },
          ]} />
        </Card>

        {/* 05 volatile */}
        <Card title="volatile" num="05" color="purple">
          <CodeBlock code={c_volatile} />
          <Tip color="purple">
            <strong>volatile ≠ atomic.</strong> <code>volatile</code> only prevents the compiler from caching or reordering accesses — it gives no guarantees about CPU cache coherency or memory ordering between threads. Use <code>std::atomic&lt;T&gt;</code> for thread-safe shared state.
          </Tip>
        </Card>

        {/* 06 Structured Bindings */}
        <Card title="Structured Bindings (C++17)" num="06" color="purple" size="md">
          <SectionLabel>Decompose aggregates, pairs, tuples</SectionLabel>
          <CodeBlock code={c_structured} />
          <InfoTable rows={[
            { key: "auto [a, b] = x",   value: "Copies x then binds a and b to the copy's members." },
            { key: "auto& [a, b] = x",  value: "Binds by reference — modifies the original." },
            { key: "const auto& [a, b]", value: "Read-only reference binding — no copy, no mutation." },
          ]} />
        </Card>

      </div>
    </>
  );
}

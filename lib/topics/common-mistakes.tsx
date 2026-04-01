import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_ub = `\
// Undefined Behavior — the compiler assumes UB never happens
// and may optimize assuming it's unreachable

// ── Signed integer overflow ───────────────────────────────────
int x = INT_MAX;
x + 1;           // ❌ UB — compiler may assume this never occurs
// Fix: use unsigned for wrapping, or check before adding

// ── Null / dangling pointer dereference ───────────────────────
int* p = nullptr;
*p = 5;          // ❌ UB — segfault on most platforms, silently wrong on others

int* dangling;
{ int x = 5; dangling = &x; }
*dangling;       // ❌ UB — x is destroyed

// ── Out-of-bounds array access ───────────────────────────────
int arr[5];
arr[5] = 0;      // ❌ UB — one past the end

// ── Use after move ────────────────────────────────────────────
std::string s = "hello";
std::string t = std::move(s);
s.size();        // 🟡 valid (moved-from is a valid empty state for string)
// But for user types, moved-from state may be unspecified

// ── Detect: -fsanitize=address,undefined ─────────────────────
// AddressSanitizer: out-of-bounds, use-after-free, stack overflow
// UBSanitizer: signed overflow, null deref, misaligned access`;

const c_initorder = `\
// ── Uninitialized local variables ────────────────────────────
int x;          // garbage value — reading x is UB
std::cout << x; // ❌ UB — may print anything or crash
// Fix: always initialize: int x = 0; or int x{};

// ── Static initialization order fiasco (across TUs) ──────────
// file a.cpp
int Registry::count = 0;

// file b.cpp — may be initialized BEFORE a.cpp
extern int Registry::count;
int derived = Registry::count + 1;  // ⚠ may be 0

// Fix: use function-local statics (initialized on first call)
int& getCount() { static int n = 0; return n; }

// ── Member initialization order ──────────────────────────────
struct Bad {
  int b;
  int a;
  Bad() : a(5), b(a * 2) {}  // ⚠ b initialized first! a is garbage here
  // Members init in DECLARATION ORDER, not initializer list order
};
// Fix: reorder members or use a in the body after all inits`;

const c_memory_mistakes = `\
// ── Double delete ─────────────────────────────────────────────
int* p = new int(5);
delete p;
delete p;        // ❌ UB — corrupts the heap

// Fix: null after delete, or better: use unique_ptr

// ── Memory leak ───────────────────────────────────────────────
void leak() {
  int* p = new int[100];
  if (error) return;  // ❌ new[] never freed on this path
  delete[] p;
}
// Fix: use std::vector<int>(100) or unique_ptr<int[]>

// ── delete vs delete[] ────────────────────────────────────────
int* arr = new int[10];
delete arr;        // ❌ UB — must use delete[]
delete[] arr;      // ✅

// ── Stack buffer overflow ─────────────────────────────────────
char buf[8];
std::strcpy(buf, "this string is too long");  // ❌ UB
// Fix: use std::string — no fixed buffer

// ── Returning local reference ─────────────────────────────────
int& bad() { int x = 5; return x; }  // ❌ x destroyed on return`;

const c_type_mistakes = `\
// ── Integer division truncates ────────────────────────────────
int a = 5, b = 2;
double ratio = a / b;    // ❌ 2.0 — integer division first!
double ratio2 = (double)a / b;  // ✅ 2.5

// ── Signed / unsigned comparison ─────────────────────────────
int  s = -1;
unsigned u = 1;
s < u;    // ❌ false! -1 wraps to huge unsigned value
// Fix: cast to the same type or use std::cmp_less (C++20)

// ── Narrowing in assignments ──────────────────────────────────
double d = 3.99;
int i = d;          // ⚠ i = 3 (truncated, no warning without -Wconversion)
int j{d};           // ❌ compile error — brace init prevents narrowing

// ── Implicit bool conversion surprises ────────────────────────
std::string s = "hello";
if (s) { }          // ❌ compile error — string doesn't convert to bool
if (!s.empty()) { } // ✅

// ── char signedness ───────────────────────────────────────────
char c = 200;       // may be -56 if char is signed (platform-dependent)
// Fix: use unsigned char or uint8_t for byte values`;

const c_stl_mistakes = `\
// ── Iterator invalidation ────────────────────────────────────
std::vector<int> v = {1,2,3,4,5};
for (auto it = v.begin(); it != v.end(); ++it) {
  if (*it == 3) v.erase(it);  // ❌ it is now invalid!
}
// Fix: use erase-remove idiom
v.erase(std::remove(v.begin(), v.end(), 3), v.end());

// ── Off-by-one with indices ───────────────────────────────────
for (int i = 0; i <= v.size(); i++) {  // ❌ i == v.size() is OOB
  v[i];
}
// Fix: i < v.size() (or use range-for)

// ── std::map operator[] creates entries ──────────────────────
std::map<std::string, int> m;
m["key"];           // ❌ inserts "key"→0 if not present!
// Fix: use m.find("key") or m.count("key")

// ── Copying when you should move ─────────────────────────────
std::vector<std::string> words = {"hello","world"};
std::string s = words[0];       // copy
std::string t = std::move(words[0]);  // move — words[0] is now empty

// ── endl performance ──────────────────────────────────────────
for (int i = 0; i < 1000; i++)
  std::cout << i << std::endl;  // ❌ flushes buffer 1000 times — slow
  // Fix: use "\\n"`;

const c_tools = `\
# ── Compiler warnings — enable all ───────────────────────────
g++ -Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror

# ── Runtime sanitizers (catch UB and memory errors) ──────────
g++ -fsanitize=address,undefined -g -O1
# AddressSanitizer: OOB, use-after-free, stack overflow, leaks
# UBSanitizer: signed overflow, null deref, misaligned access

# ── Valgrind (Linux) — memory leak and error detection ────────
valgrind --leak-check=full --error-exitcode=1 ./program

# ── Static analyzers ──────────────────────────────────────────
clang-tidy main.cpp -- -std=c++17   # catches many common mistakes
cppcheck --enable=all main.cpp      # lightweight, fast

# ── Address sanitizer is the fastest first check ─────────────
# It finds ~80% of memory bugs at 2× slowdown
# Run it in CI on every build

# ── clang-tidy checks to enable ──────────────────────────────
# -checks=cppcoreguidelines-*  (C++ Core Guidelines)
# -checks=modernize-*          (prefer modern C++ idioms)
# -checks=bugprone-*           (common bug patterns)`;

// ── Page component ──────────────────────────────────────────────────────────

export default function CommonMistakesPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="C++ Mistake Categories" num="01" color="red" size="lg">
          <Prose>
            <H3>Why C++ mistakes are dangerous</H3>
            <P>
              Many C++ mistakes produce <Code>Undefined Behavior (UB)</Code> — the compiler is free
              to do anything, including producing code that appears to work correctly in debug builds
              but silently corrupts data in release builds. The compiler actively exploits UB for
              optimization, which is why sanitizers are essential.
            </P>
            <Grid>
              <Cell>
                <H3>Mistake categories</H3>
                <OL>
                  <LI><Code>Undefined Behavior</Code> — signed overflow, null deref, OOB access, data races</LI>
                  <LI><Code>Initialization</Code> — reading uninitialized locals, member init order, SIOF</LI>
                  <LI><Code>Memory</Code> — leaks, double-delete, delete vs delete[], dangling refs</LI>
                  <LI><Code>Type system</Code> — integer division, signed/unsigned comparison, narrowing</LI>
                  <LI><Code>STL misuse</Code> — iterator invalidation, map[], off-by-one, endl spam</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Defence strategy</H3>
                <OL>
                  <LI>Compile with <Code>-Wall -Wextra -Werror</Code> — catch mistakes at compile time.</LI>
                  <LI>Use <Code>-fsanitize=address,undefined</Code> in CI — catches runtime UB.</LI>
                  <LI>Prefer modern C++ — <Code>std::vector</Code> over raw arrays, <Code>unique_ptr</Code> over <Code>new</Code>, range-for over index loops.</LI>
                  <LI>Run a static analyzer (<Code>clang-tidy</Code>, <Code>cppcheck</Code>) on every PR.</LI>
                </OL>
                <Note>Most C++ bugs caught in production could have been caught at compile time with stricter warnings, or at test time with sanitizers.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 UB */}
        <Card title="Undefined Behavior" num="02" color="red" size="md">
          <CodeBlock code={c_ub} />
          <InfoTable rows={[
            { key: "signed overflow",  value: "UB — the compiler assumes it never occurs and optimizes accordingly. Use unsigned for wrapping arithmetic." },
            { key: "null deref",       value: "UB — always null-check pointers before dereferencing, especially from find() or optional APIs." },
            { key: "out-of-bounds",    value: "UB — no exception, no crash guaranteed. Use .at() or enable AddressSanitizer." },
            { key: "use-after-move",   value: "Moved-from objects are in a valid but unspecified state. Reassign before reuse." },
          ]} />
          <Tip color="red">
            <strong>Build with <code>-fsanitize=address,undefined</code> during development.</strong> ASan + UBSan catches the vast majority of memory and UB bugs at ~2× runtime overhead — far cheaper than debugging in production.
          </Tip>
        </Card>

        {/* 03 Initialization */}
        <Card title="Initialization Mistakes" num="03" color="red" size="md">
          <CodeBlock code={c_initorder} />
          <InfoTable rows={[
            { key: "uninitialized local",  value: "Reading an uninitialized local variable is UB. Always initialize: int x{} or int x = 0." },
            { key: "SIOF",                 value: "Static Initialization Order Fiasco — globals in different .cpp files may init in any order. Use function-local statics." },
            { key: "member init order",    value: "Members initialize in declaration order, not the order listed in the initializer list. Reorder the declaration to fix." },
          ]} />
        </Card>

        {/* 04 Memory */}
        <Card title="Memory Mistakes" num="04" color="red" size="md">
          <CodeBlock code={c_memory_mistakes} />
          <InfoTable rows={[
            { key: "double delete",    value: "Corrupts the heap — undefined behavior. Null after delete, or use unique_ptr." },
            { key: "delete vs delete[]", value: "new T[] must be paired with delete[], not delete. Wrong pairing is UB." },
            { key: "memory leak",      value: "new without delete. Use RAII: vector, unique_ptr, or any standard container." },
            { key: "dangling ref",     value: "Returning a reference to a local variable. The compiler may not warn — enable -Wreturn-local-addr." },
          ]} />
        </Card>

        {/* 05 Type Mistakes */}
        <Card title="Type System Mistakes" num="05" color="red" size="md">
          <CodeBlock code={c_type_mistakes} />
          <InfoTable rows={[
            { key: "integer division",   value: "5/2 == 2. Cast one operand to double before dividing: (double)a / b." },
            { key: "signed/unsigned cmp", value: "-1 < 1u is false. Enable -Wsign-compare. Use C++20 std::cmp_less for safe comparison." },
            { key: "narrowing",          value: "double → int silently truncates with = but is a compile error with {}. Prefer brace init." },
            { key: "char signedness",    value: "char signedness is platform-defined. Use unsigned char or uint8_t for byte manipulation." },
          ]} />
        </Card>

        {/* 06 STL Mistakes */}
        <Card title="STL Mistakes" num="06" color="red" size="md">
          <CodeBlock code={c_stl_mistakes} />
          <InfoTable rows={[
            { key: "iterator invalidation", value: "Erasing from a vector inside a loop invalidates the iterator. Use erase-remove idiom instead." },
            { key: "map operator[]",        value: "m[key] inserts a default value if key doesn't exist. Use m.find() or m.contains() (C++20) to check." },
            { key: "endl vs \\n",           value: "endl = newline + flush. Using it in a tight loop flushes the buffer every iteration — use \\n." },
            { key: "off-by-one",            value: "i <= v.size() accesses v[v.size()] which is out-of-bounds UB. Always use i < v.size()." },
          ]} />
        </Card>

        {/* 07 Tools */}
        <Card title="Diagnostic Tools" num="07" color="red" size="md">
          <CodeBlock code={c_tools} />
          <InfoTable rows={[
            { key: "-Wall -Wextra",        value: "Enable all standard and extra warnings. Add -Werror to make warnings into errors." },
            { key: "-fsanitize=address",   value: "AddressSanitizer — catches OOB, use-after-free, leaks. ~2× slowdown. Use in CI." },
            { key: "-fsanitize=undefined", value: "UBSanitizer — catches signed overflow, null deref, misaligned access. Low overhead." },
            { key: "clang-tidy",           value: "Static analysis — catches patterns that compile cleanly but are likely bugs or non-idiomatic." },
          ]} />
        </Card>

      </div>
    </>
  );
}

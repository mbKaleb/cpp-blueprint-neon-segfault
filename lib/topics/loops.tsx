import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_for = `\
// for (init; condition; increment)
for (int i = 0; i < 10; i++) {
  std::cout << i << " ";
}

// Multiple variables (same type)
for (int i = 0, j = 9; i < j; i++, j--) { }

// Infinite loop
for (;;) {
  if (done) break;
}

// ── Pitfalls ─────────────────────────────────────────────────
// Signed / unsigned mismatch — common warning
std::vector<int> v = {1,2,3};
for (int i = 0; i < v.size(); i++) { }  // ⚠ int vs size_t

// Fix 1: use size_t
for (std::size_t i = 0; i < v.size(); i++) { }

// Fix 2: use ptrdiff_t for reverse iteration
for (std::ptrdiff_t i = v.size()-1; i >= 0; i--) { }

// Fix 3: just use range-for (best)
for (auto& x : v) { }`;

const c_while = `\
// while — test first, may not execute at all
int i = 0;
while (i < 5) {
  std::cout << i++;
}

// do-while — executes at least once
int attempts = 0;
do {
  attempts++;
} while (!tryConnect() && attempts < 3);

// ── Reading until EOF ────────────────────────────────────────
int n;
while (std::cin >> n) {      // evaluates to false on EOF or error
  process(n);
}

// ── Polling / event loop ─────────────────────────────────────
while (running) {
  processEvents();
  update();
  render();
}`;

const c_range = `\
// Range-based for (C++11) — preferred for container iteration
std::vector<int> v = {1, 2, 3, 4, 5};

for (int x : v)        { }   // copies each element
for (auto x : v)       { }   // auto deduces int — also copies
for (const auto& x : v){ }   // ✅ const ref — no copy, no modify
for (auto& x : v)      { }   // ✅ ref — modifies original

// Works on anything with begin() / end()
std::string s = "hello";
for (char c : s) { std::cout << c; }

std::array<int,3> arr = {10, 20, 30};
for (auto x : arr) { }

// C-style array
int raw[4] = {1,2,3,4};
for (int x : raw) { }     // ✅ works — size known at compile time

// ── With index (C++20 not needed — use a counter)
int idx = 0;
for (auto& x : v) {
  std::cout << idx++ << ": " << x << "\\n";
}`;

const c_control = `\
// break — exit the innermost loop (or switch) immediately
for (int i = 0; i < 100; i++) {
  if (i == 42) break;    // stops here
}

// continue — skip to next iteration
for (int i = 0; i < 10; i++) {
  if (i % 2 == 0) continue;   // skip even numbers
  std::cout << i << " ";      // prints: 1 3 5 7 9
}

// ── Breaking out of nested loops ────────────────────────────
// goto (one of its few legitimate uses)
for (int i = 0; i < n; i++) {
  for (int j = 0; j < m; j++) {
    if (grid[i][j] == target) goto found;
  }
}
found:

// Alternative: wrap in a lambda and return
auto search = [&]() -> std::pair<int,int> {
  for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++)
      if (grid[i][j] == target) return {i, j};
  return {-1, -1};
};`;

const c_algorithms = `\
#include <algorithm>
#include <numeric>

std::vector<int> v = {3, 1, 4, 1, 5, 9};

// Replace most hand-written loops with standard algorithms

// Count / search
auto it = std::find(v.begin(), v.end(), 4);
int  cnt = std::count(v.begin(), v.end(), 1);      // 2

// Transform (map each element)
std::vector<int> out(v.size());
std::transform(v.begin(), v.end(), out.begin(),
               [](int x){ return x * 2; });

// Accumulate (fold / reduce)
int sum = std::accumulate(v.begin(), v.end(), 0);  // 23

// All / any / none
bool anyNeg = std::any_of(v.begin(), v.end(), [](int x){ return x < 0; });

// for_each (when you need side effects)
std::for_each(v.begin(), v.end(), [](int& x){ x *= 2; });

// C++20 ranges — same without begin()/end()
#include <ranges>
for (int x : v | std::views::filter([](int x){ return x > 3; })) {
  std::cout << x << " ";   // 4 5 9
}`;

const c_perf = `\
// ── Cache efficiency matters more than loop structure ────────
// Row-major access (correct for C++ arrays)
for (int i = 0; i < N; i++)       // outer: row
  for (int j = 0; j < M; j++)     // inner: column
    sum += matrix[i][j];           // ✅ sequential memory

// Column-major (cache-unfriendly — cache misses every access)
for (int j = 0; j < M; j++)
  for (int i = 0; i < N; i++)
    sum += matrix[i][j];           // ❌ stride-N access

// ── Loop hoisting — move invariant computation out ───────────
// ❌ Recomputes v.size() every iteration (compiler may optimize, but don't rely on it)
for (int i = 0; i < (int)v.size(); i++) { }

// ✅ Hoist the size
const auto n = v.size();
for (std::size_t i = 0; i < n; i++) { }

// ── Early termination beats full traversal ───────────────────
for (auto& x : v) {
  if (x == target) return x;   // stop as soon as found
}

// ── Prefer algorithms — the optimizer knows them ─────────────
// std::find, std::count, std::accumulate can be vectorized by
// the compiler better than equivalent hand-written loops`;

// ── Page component ──────────────────────────────────────────────────────────

export default function LoopsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Loop Types in C++" num="01" color="purple" size="lg">
          <Prose>
            <H3>Three loop constructs</H3>
            <P>
              C++ has three loop statements. The right choice depends on whether you know the
              iteration count upfront, need at least one execution, or are iterating a range.
            </P>
            <Grid>
              <Cell>
                <H3>Choosing a loop</H3>
                <OL>
                  <LI><Code>for</Code> — use when you know the count or need an index. Init, condition, and increment are all in one line.</LI>
                  <LI><Code>while</Code> — use when the count is unknown and the loop might not execute at all.</LI>
                  <LI><Code>do-while</Code> — use when the body must run at least once (e.g., input validation, retry logic).</LI>
                  <LI><Code>range-for</Code> — use whenever iterating all elements of a container. Cleaner and harder to get wrong.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Key rules</H3>
                <OL>
                  <LI>Prefer <Code>const auto&amp;</Code> in range-for to avoid copies and prevent accidental mutation.</LI>
                  <LI>Avoid comparing <Code>int</Code> loop counters to <Code>.size()</Code> — use <Code>std::size_t</Code> or range-for.</LI>
                  <LI>Prefer standard algorithms (<Code>std::find</Code>, <Code>std::transform</Code>) over raw loops — they express intent and optimize better.</LI>
                  <LI>Break nested loops with a lambda return or <Code>goto found:</Code> — not a boolean flag and extra condition check.</LI>
                </OL>
                <Note>C++20 ranges let you compose lazy filters and transforms without writing a loop at all.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 for loop */}
        <Card title="for Loop" num="02" color="purple" size="md">
          <CodeBlock code={c_for} />
          <InfoTable rows={[
            { key: "for (;;)",          value: "Infinite loop — all three clauses are optional. Use break to exit." },
            { key: "int i, j = ...",    value: "Multiple variables can be declared in the init clause if they share the same type." },
            { key: "i < v.size()",      value: "Signed/unsigned comparison warning — i is int, size() returns size_t. Use size_t or range-for." },
            { key: "reverse iteration", value: "Use ptrdiff_t (signed) for the counter — size_t wraps to max on i-- when i==0." },
          ]} />
        </Card>

        {/* 03 while & do-while */}
        <Card title="while & do-while" num="03" color="purple" size="md">
          <CodeBlock code={c_while} />
          <InfoTable rows={[
            { key: "while (cin >> n)",  value: "The stream evaluates to false on EOF or parse error — idiomatic way to read all input." },
            { key: "do-while",          value: "Body executes before the first condition check. Use for retry logic and menu loops." },
            { key: "while (true)",      value: "Infinite loop — same as for(;;). Prefer for(;;) in C++ by convention." },
          ]} />
        </Card>

        {/* 04 Range-based for */}
        <Card title="Range-Based for (C++11)" num="04" color="purple" size="md">
          <CodeBlock code={c_range} />
          <InfoTable rows={[
            { key: "for (auto x : v)",       value: "Copies each element. Fine for small types (int, char), wasteful for large objects." },
            { key: "for (const auto& x : v)", value: "Const reference — no copy, read-only. Prefer this for most range-for loops." },
            { key: "for (auto& x : v)",       value: "Mutable reference — modifies elements in-place." },
            { key: "custom types",             value: "Any type with begin() and end() works — including your own types." },
          ]} />
          <Tip color="purple">
            <strong>Default to <code>const auto&amp;</code>.</strong> It works for every type, never copies, and the compiler will tell you if you accidentally try to modify a const element.
          </Tip>
        </Card>

        {/* 05 break & continue */}
        <Card title="break · continue · Nested Loops" num="05" color="purple" size="md">
          <CodeBlock code={c_control} />
          <InfoTable rows={[
            { key: "break",      value: "Exits the innermost enclosing loop or switch. Does not break outer loops." },
            { key: "continue",   value: "Skips the rest of the current iteration and jumps to the next condition check / increment." },
            { key: "goto found", value: "One of the few legitimate uses of goto — breaking out of deeply nested loops cleanly." },
            { key: "lambda",     value: "Wrap nested loops in a lambda and use return — structured, no goto needed." },
          ]} />
        </Card>

        {/* 06 Algorithms */}
        <Card title="Loops → Standard Algorithms" num="06" color="purple" size="md">
          <CodeBlock code={c_algorithms} />
          <InfoTable rows={[
            { key: "std::find",        value: "Returns iterator to first match, or end(). O(n)." },
            { key: "std::transform",   value: "Applies a function to each element, storing results in an output range." },
            { key: "std::accumulate",  value: "Folds a range into a single value. Default operation is addition." },
            { key: "std::any_of",      value: "Returns true if predicate is true for at least one element. Short-circuits." },
            { key: "C++20 views",      value: "Lazy range adaptors — filter, transform, take, drop. Compose without allocating." },
          ]} />
        </Card>

        {/* 07 Performance */}
        <Card title="Loop Performance" num="07" color="purple" size="md">
          <CodeBlock code={c_perf} />
          <InfoTable rows={[
            { key: "row-major access",  value: "Iterate rows in the outer loop, columns in the inner — matches how C++ lays out 2D arrays in memory." },
            { key: "hoist invariants",  value: "Compute loop-invariant values before the loop. The compiler often does this, but hoisting manually makes intent clear." },
            { key: "early return",      value: "Stop as soon as the answer is known. Avoids unnecessary iterations." },
            { key: "use algorithms",    value: "std:: algorithms are known to the auto-vectorizer. Hand-rolled loops may not vectorize as reliably." },
          ]} />
          <Tip color="purple">
            <strong>Cache locality is the biggest loop win.</strong> Access memory sequentially. A loop that touches 1 MB sequentially is orders of magnitude faster than one that jumps around randomly — even with fewer total accesses.
          </Tip>
        </Card>

      </div>
    </>
  );
}

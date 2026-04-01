import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_construction = `\
#include <vector>

// Construction
std::vector<int> a;                     // empty
std::vector<int> b(5);                  // 5 zeros
std::vector<int> c(5, 42);              // {42,42,42,42,42}
std::vector<int> d = {1, 2, 3, 4, 5};  // initializer list
std::vector<int> e(d);                  // copy of d
std::vector<int> f(d.begin(), d.begin()+3); // {1,2,3} — iterator range

// 2D vector
std::vector<std::vector<int>> mat(3, std::vector<int>(4, 0)); // 3×4 zeros

// Access
d[2]          // 2 — unchecked, UB on out-of-bounds
d.at(2)       // 2 — throws std::out_of_range
d.front()     // 1 — first element
d.back()      // 5 — last element
d.data()      // raw int* to internal buffer`;

const c_modifying = `\
std::vector<int> v = {1, 2, 3};

// Add / remove at end (fast — amortized O(1))
v.push_back(4);          // {1,2,3,4}
v.pop_back();            // {1,2,3}
v.emplace_back(4);       // same as push_back but constructs in-place

// Insert / erase (slow — O(n) — shifts elements)
v.insert(v.begin() + 1, 99);   // {1,99,2,3} — insert before index 1
v.erase(v.begin() + 1);        // {1,2,3}    — erase at index 1
v.erase(v.begin()+1, v.begin()+3); // erase range [1,3)

// Clear & resize
v.clear();               // empty, capacity unchanged
v.resize(5);             // size=5, new elements zero-initialized
v.resize(5, 99);         // size=5, new elements = 99
v.assign(3, 0);          // replace contents with {0,0,0}

// ── Erase-remove idiom (remove all matching values) ──────────
#include <algorithm>
v.erase(std::remove(v.begin(), v.end(), 2), v.end());
// C++20: std::erase(v, 2);  — cleaner shorthand`;

const c_capacity = `\
std::vector<int> v;

v.size()       // number of elements currently stored
v.capacity()   // number of elements that fit without reallocation
v.empty()      // true if size() == 0

// ── Reserve — avoid repeated reallocations ───────────────────
v.reserve(1000);        // allocate for 1000 elements upfront
for (int i = 0; i < 1000; i++) v.push_back(i);  // no reallocations

// ── Growth policy ────────────────────────────────────────────
// When capacity is exceeded, vector reallocates to ~2× the current
// capacity and moves all elements. This is why pointers/iterators
// into a vector are invalidated after push_back!
int* ptr = &v[0];
v.push_back(999);   // ⚠ ptr may now be dangling if reallocation occurred

// ── shrink_to_fit ─────────────────────────────────────────────
v.shrink_to_fit();  // hint to release excess capacity (non-binding)

// ── swap trick (guaranteed shrink) ───────────────────────────
std::vector<int>(v).swap(v);   // copy into exact-fit vector, swap`;

const c_iterators = `\
std::vector<int> v = {10, 20, 30, 40, 50};

// Iterator types
auto it  = v.begin();   // iterator to first element
auto end = v.end();     // iterator past the last element
auto rit = v.rbegin();  // reverse iterator — points to last element

// Dereferencing and arithmetic
*it         // 10
*(it + 2)   // 30
it[2]       // 30 — random access iterator supports []

// Loop with iterator
for (auto it = v.begin(); it != v.end(); ++it) {
  std::cout << *it << " ";
}

// ── Iterator invalidation — the silent killer ─────────────────
auto saved = v.begin() + 2;   // points to 30
v.push_back(60);               // ⚠ may reallocate — saved is dangling!
v.insert(v.begin(), 0);        // all iterators invalidated

// Safe pattern: re-obtain iterator after mutation
// Or: use indices instead of iterators when modifying`;

const c_algorithms = `\
#include <algorithm>
#include <numeric>

std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};

// Sort
std::sort(v.begin(), v.end());              // ascending: {1,1,2,3,4,5,6,9}
std::sort(v.begin(), v.end(), std::greater<int>()); // descending

// Search (requires sorted for binary search)
bool found = std::binary_search(v.begin(), v.end(), 4);
auto it = std::lower_bound(v.begin(), v.end(), 4);  // first ≥ 4

// Min / max element
auto minIt = std::min_element(v.begin(), v.end());  // iterator
auto maxIt = std::max_element(v.begin(), v.end());

// Accumulate
int sum = std::accumulate(v.begin(), v.end(), 0);   // 31
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>());

// Unique (removes consecutive duplicates — sort first)
std::sort(v.begin(), v.end());
v.erase(std::unique(v.begin(), v.end()), v.end());  // {1,2,3,4,5,6,9}

// Partition
auto mid = std::partition(v.begin(), v.end(), [](int x){ return x % 2 == 0; });`;

const c_move = `\
// Moving a vector — O(1), no element copies
std::vector<int> a = {1, 2, 3, 4, 5};
std::vector<int> b = std::move(a);  // b owns the data; a is now empty
a.empty();   // true — a was moved-from

// emplace_back vs push_back
struct Point { double x, y; };
std::vector<Point> pts;

pts.push_back({1.0, 2.0});           // constructs Point, then moves into vector
pts.emplace_back(1.0, 2.0);          // constructs Point directly in vector — no move

// Moving out of a vector element
std::vector<std::string> words = {"hello", "world"};
std::string s = std::move(words[0]); // s="hello", words[0] is valid but unspecified
// words[0] is in a valid but unspecified state — don't read it

// Returning a vector from a function — RVO applies, no copy
std::vector<int> makeRange(int n) {
  std::vector<int> v(n);
  std::iota(v.begin(), v.end(), 0);  // fill with 0,1,...,n-1
  return v;   // NRVO — no copy or move in practice
}`;

// ── Page component ──────────────────────────────────────────────────────────

export default function VectorsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="std::vector Internals" num="01" color="cyan" size="lg">
          <Prose>
            <H3>How vector works</H3>
            <P>
              <Code>std::vector&lt;T&gt;</Code> owns a contiguous heap-allocated buffer. It tracks
              two numbers: <Code>size</Code> (elements in use) and <Code>capacity</Code> (elements
              that fit before the next reallocation). When you <Code>push_back</Code> past capacity,
              the vector allocates a new buffer (~2× larger), moves all elements, and frees the old one.
            </P>
            <Grid>
              <Cell>
                <H3>Complexity</H3>
                <OL>
                  <LI><Code>push_back</Code> / <Code>pop_back</Code> — amortized O(1). Occasional O(n) reallocation, but rare.</LI>
                  <LI><Code>operator[]</Code> / <Code>at()</Code> — O(1) random access.</LI>
                  <LI><Code>insert</Code> / <Code>erase</Code> at middle — O(n). Shifts all elements after the point.</LI>
                  <LI><Code>find</Code> (unsorted) — O(n). <Code>binary_search</Code> (sorted) — O(log n).</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Iterator invalidation rules</H3>
                <OL>
                  <LI><Code>push_back</Code> / <Code>emplace_back</Code> — invalidates all iterators if reallocation occurs.</LI>
                  <LI><Code>insert</Code> / <Code>erase</Code> — invalidates iterators at or after the point of change.</LI>
                  <LI><Code>reserve</Code> — may invalidate all iterators (if reallocation happens).</LI>
                  <LI><Code>pop_back</Code> / <Code>resize</Code> smaller — only <Code>end()</Code> and erased elements invalidated.</LI>
                </OL>
                <Note>When in doubt after mutating a vector, re-obtain iterators. Using indices is safer than storing iterators across mutations.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Construction & Access */}
        <Card title="Construction & Access" num="02" color="cyan" size="md">
          <CodeBlock code={c_construction} />
          <InfoTable rows={[
            { key: "vector<int>(n)",      value: "n zero-initialized elements." },
            { key: "vector<int>(n, val)", value: "n copies of val." },
            { key: "v[i]",               value: "Unchecked — undefined behavior if i >= size(). Fast." },
            { key: "v.at(i)",            value: "Bounds-checked — throws std::out_of_range. Use during development/testing." },
            { key: "iterator range ctor", value: "vector<int>(first, last) — copies elements from any iterator range." },
          ]} />
        </Card>

        {/* 03 Modifying */}
        <Card title="Modifying a Vector" num="03" color="cyan" size="md">
          <CodeBlock code={c_modifying} />
          <InfoTable rows={[
            { key: "push_back(x)",     value: "Copies or moves x to the end. Amortized O(1)." },
            { key: "emplace_back(...)", value: "Constructs element in-place from arguments. Avoids the extra move. Prefer for non-trivial types." },
            { key: "insert(it, x)",    value: "O(n) — shifts everything after it. Avoid in hot loops." },
            { key: "erase-remove",     value: "The standard idiom for removing all elements matching a value or predicate. C++20: std::erase(v, val)." },
          ]} />
        </Card>

        {/* 04 Capacity */}
        <Card title="Size vs Capacity" num="04" color="cyan" size="md">
          <CodeBlock code={c_capacity} />
          <InfoTable rows={[
            { key: "reserve(n)",      value: "Pre-allocates capacity for n elements. Prevents reallocations when final size is known. Does not change size()." },
            { key: "resize(n)",       value: "Changes size() to n. Adds zero-initialized elements if growing; destroys elements if shrinking." },
            { key: "shrink_to_fit()", value: "Non-binding hint to release excess capacity. Use after large removals to reclaim memory." },
            { key: "reallocation",    value: "Invalidates ALL pointers, references, and iterators into the vector. Call reserve() upfront to prevent." },
          ]} />
          <Tip color="cyan">
            <strong>Always <code>reserve()</code> when the final size is known.</strong> Without it, a vector of 1M elements will reallocate ~20 times. With <code>reserve(1'000'000)</code> — zero reallocations.
          </Tip>
        </Card>

        {/* 05 Iterators */}
        <Card title="Iterators & Invalidation" num="05" color="cyan" size="md">
          <CodeBlock code={c_iterators} />
          <InfoTable rows={[
            { key: "begin() / end()",    value: "Forward iterators. end() is past-the-last — never dereference it." },
            { key: "rbegin() / rend()",  value: "Reverse iterators. rbegin() points to the last element." },
            { key: "cbegin() / cend()",  value: "Const iterators — cannot modify elements through them." },
            { key: "invalidation",       value: "Any operation that changes capacity (push_back, insert, reserve) may invalidate all iterators." },
          ]} />
          <Tip color="cyan">
            <strong>Use indices when mutating.</strong> Iterators are invalidated by reallocation. An index into v remains valid as long as you don&apos;t erase elements before it.
          </Tip>
        </Card>

        {/* 06 Algorithms */}
        <Card title="Vectors & Algorithms" num="06" color="cyan" size="md">
          <CodeBlock code={c_algorithms} />
          <InfoTable rows={[
            { key: "lower_bound",   value: "Binary search on a sorted range — returns iterator to first element ≥ value. O(log n)." },
            { key: "unique",        value: "Removes consecutive duplicates. Sort first to remove all duplicates globally." },
            { key: "partition",     value: "Reorders so elements matching predicate come first. Returns iterator to first non-matching element." },
            { key: "iota",          value: "Fills range with sequentially increasing values: 0,1,2,… Use for index generation." },
          ]} />
        </Card>

        {/* 07 Move Semantics */}
        <Card title="Move Semantics & emplace" num="07" color="cyan" size="md">
          <CodeBlock code={c_move} />
          <InfoTable rows={[
            { key: "std::move(v)",     value: "Transfers ownership of the buffer in O(1). The moved-from vector is left empty and valid." },
            { key: "emplace_back",     value: "Forwards constructor arguments directly — constructs in-place, no temporary object." },
            { key: "moved-from state", value: "A moved-from vector is in a valid but unspecified state. You can clear() or reassign it safely." },
            { key: "return vector",    value: "NRVO applies — returning a local vector is free. Don't std::move the return value." },
          ]} />
        </Card>

      </div>
    </>
  );
}

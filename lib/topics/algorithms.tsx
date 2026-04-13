import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_sorting = `\
#include <algorithm>
std::vector<int> v = {5, 2, 8, 1, 9, 3};

// ── Sort ──────────────────────────────────────────────────────
std::sort(v.begin(), v.end());                     // ascending
std::sort(v.begin(), v.end(), std::greater<int>()); // descending
std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });

// Sort objects by a field
struct Person { std::string name; int age; };
std::sort(people.begin(), people.end(),
  [](const Person& a, const Person& b){ return a.age < b.age; });

// ── Stable sort — preserves relative order of equal elements ──
std::stable_sort(v.begin(), v.end());

// ── Partial sort — only sort first k elements ─────────────────
std::partial_sort(v.begin(), v.begin()+3, v.end()); // smallest 3 sorted
// Useful when you only need the top-N results

// ── nth_element — O(n) partition, not full sort ───────────────
std::nth_element(v.begin(), v.begin()+2, v.end());
// v[2] is now the element that WOULD be at index 2 if sorted
// elements before v[2] are ≤ v[2], elements after are ≥ v[2]

// ── Check if sorted ───────────────────────────────────────────
std::is_sorted(v.begin(), v.end());   // true / false`;

const c_searching = `\
std::vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9};  // must be sorted for binary search

// ── Linear search (unsorted) — O(n) ──────────────────────────
auto it = std::find(v.begin(), v.end(), 5);
if (it != v.end()) std::cout << "found at index " << (it - v.begin());

// Find by predicate
auto it2 = std::find_if(v.begin(), v.end(), [](int x){ return x > 5; });

// ── Binary search (sorted) — O(log n) ────────────────────────
bool found = std::binary_search(v.begin(), v.end(), 5);  // true/false only

// lower_bound: first element >= value
auto lo = std::lower_bound(v.begin(), v.end(), 5);  // points to 5

// upper_bound: first element > value
auto hi = std::upper_bound(v.begin(), v.end(), 5);  // points to 6

// equal_range: [lower_bound, upper_bound) — all elements == value
auto [first, last] = std::equal_range(v.begin(), v.end(), 5);
std::distance(first, last);   // count of matching elements

// ── Min / max ─────────────────────────────────────────────────
auto [minIt, maxIt] = std::minmax_element(v.begin(), v.end());
std::min({3, 1, 4, 1, 5});   // initializer_list overload — 1
std::clamp(x, lo, hi);        // clamp x to [lo, hi]`;

const c_transform = `\
std::vector<int> v = {1, 2, 3, 4, 5};
std::vector<int> out(v.size());

// ── transform — apply function to each element ───────────────
std::transform(v.begin(), v.end(), out.begin(),
  [](int x){ return x * x; });           // {1, 4, 9, 16, 25}

// Binary transform — combine two ranges
std::vector<int> a = {1,2,3}, b = {10,20,30};
std::transform(a.begin(), a.end(), b.begin(), out.begin(),
  [](int x, int y){ return x + y; });    // {11, 22, 33}

// ── for_each — side effects on each element ──────────────────
std::for_each(v.begin(), v.end(), [](int& x){ x *= 2; });  // modifies in-place

// ── fill / generate ──────────────────────────────────────────
std::fill(v.begin(), v.end(), 0);          // all zeros
std::fill_n(v.begin(), 3, 99);            // first 3 = 99

int n = 0;
std::generate(v.begin(), v.end(), [&n]{ return n++; }); // 0,1,2,3,4

// ── replace ──────────────────────────────────────────────────
std::replace(v.begin(), v.end(), 0, -1);   // replace all 0s with -1
std::replace_if(v.begin(), v.end(),
  [](int x){ return x < 0; }, 0);          // replace negatives with 0`;

const c_reorder = `\
std::vector<int> v = {1, 2, 3, 4, 5, 6};

// ── reverse ──────────────────────────────────────────────────
std::reverse(v.begin(), v.end());          // {6,5,4,3,2,1}

// ── rotate — shift elements left by n positions ──────────────
std::rotate(v.begin(), v.begin()+2, v.end());  // {3,4,5,6,1,2}

// ── shuffle — randomize order ────────────────────────────────
#include <random>
std::mt19937 rng(std::random_device{}());
std::shuffle(v.begin(), v.end(), rng);

// ── partition — split by predicate ───────────────────────────
auto mid = std::partition(v.begin(), v.end(),
  [](int x){ return x % 2 == 0; });   // evens first, then odds
// mid points to first odd element

// ── unique — remove consecutive duplicates ────────────────────
std::sort(v.begin(), v.end());
auto newEnd = std::unique(v.begin(), v.end());
v.erase(newEnd, v.end());   // actually remove them

// ── copy / move ───────────────────────────────────────────────
std::copy(v.begin(), v.end(), out.begin());          // copy range
std::copy_if(v.begin(), v.end(), out.begin(),
  [](int x){ return x > 3; });                       // filtered copy
std::move(v.begin(), v.end(), out.begin());          // move range`;

const c_numeric = `\
#include <numeric>
std::vector<int> v = {1, 2, 3, 4, 5};

// ── accumulate — fold / reduce ───────────────────────────────
int sum  = std::accumulate(v.begin(), v.end(), 0);         // 15
int prod = std::accumulate(v.begin(), v.end(), 1,
             std::multiplies<int>());                       // 120
std::string joined = std::accumulate(words.begin(), words.end(),
  std::string{}, [](auto a, const auto& b){ return a + " " + b; });

// ── iota — fill with sequential values ───────────────────────
std::vector<int> idx(10);
std::iota(idx.begin(), idx.end(), 0);   // {0,1,2,...,9}

// ── inner_product — dot product ──────────────────────────────
int dot = std::inner_product(a.begin(), a.end(), b.begin(), 0);

// ── partial_sum — running total ──────────────────────────────
std::partial_sum(v.begin(), v.end(), out.begin());  // {1,3,6,10,15}

// ── adjacent_difference — consecutive differences ────────────
std::adjacent_difference(v.begin(), v.end(), out.begin()); // {1,1,1,1,1}

// ── C++17: reduce (parallel-friendly accumulate) ─────────────
#include <execution>
int s = std::reduce(std::execution::par, v.begin(), v.end());`;

const c_ranges = `\
// C++20: Ranges — algorithm + lazy view composition
#include <ranges>
#include <algorithm>

std::vector<int> v = {1,2,3,4,5,6,7,8,9,10};

// ── Range algorithms — no begin()/end() needed ────────────────
std::ranges::sort(v);
std::ranges::reverse(v);
auto it = std::ranges::find(v, 5);

// ── Views — lazy, composable, zero-copy ──────────────────────
namespace rv = std::views;

// Filter + transform pipeline (nothing computed until iterated)
auto even_squares = v
  | rv::filter([](int x){ return x % 2 == 0; })
  | rv::transform([](int x){ return x * x; });

for (int x : even_squares) std::cout << x << " ";  // 4 16 36 64 100

// Other useful views
v | rv::take(3)               // first 3 elements
v | rv::drop(2)               // skip first 2
v | rv::reverse               // reversed (lazy)
rv::iota(1, 11)               // {1,2,...,10} — no vector needed
rv::iota(0) | rv::take(5)     // infinite range, take first 5`;

// ── Page component ──────────────────────────────────────────────────────────

export default function AlgorithmsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="The <algorithm> Library" num="01" color="orange" size="lg">
          <Prose>
            <H3>Iterator-based design</H3>
            <P>
              Every standard algorithm operates on a <Code>range</Code> defined by two iterators:
              <Code>[first, last)</Code> — the first iterator points to the first element, the last
              points one past the end. This uniform interface means every algorithm works on
              vectors, arrays, strings, lists, and any custom container.
            </P>
            <Grid>
              <Cell>
                <H3>Algorithm categories</H3>
                <OL>
                  <LI><Code>Sorting</Code> — sort, stable_sort, partial_sort, nth_element</LI>
                  <LI><Code>Searching</Code> — find, find_if, binary_search, lower/upper_bound</LI>
                  <LI><Code>Transforming</Code> — transform, for_each, replace, fill, generate</LI>
                  <LI><Code>Reordering</Code> — reverse, rotate, shuffle, partition, unique</LI>
                  <LI><Code>Numeric</Code> — accumulate, iota, partial_sum, inner_product</LI>
                  <LI><Code>Querying</Code> — count, count_if, any_of, all_of, none_of</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Key rules</H3>
                <OL>
                  <LI>Algorithms never change container size — use erase-remove idiom to actually remove elements.</LI>
                  <LI>Most algorithms require a valid range — <Code>first &lt;= last</Code>. Violating this is UB.</LI>
                  <LI>Sorted-range algorithms (<Code>binary_search</Code>, <Code>lower_bound</Code>) require a sorted input.</LI>
                  <LI>Prefer standard algorithms over raw loops — they express intent, and the compiler can vectorize them more reliably.</LI>
                </OL>
                <Note>C++20 ranges algorithms work directly on containers: std::ranges::sort(v) instead of std::sort(v.begin(), v.end()).</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Sorting */}
        <Card title="Sorting" num="02" color="orange" size="md">
          <CodeBlock code={c_sorting} />
          <InfoTable rows={[
            { key: "sort",           value: "Introsort (quicksort + heapsort + insertion). O(n log n) worst case. Not stable." },
            { key: "stable_sort",    value: "Merge sort. O(n log n). Preserves relative order of equal elements. Use when order matters." },
            { key: "partial_sort",   value: "Sort only the first k elements. O(n log k). Use for top-N queries." },
            { key: "nth_element",    value: "O(n) average. Places the k-th element correctly; others are partitioned but not sorted. Use for median." },
          ]} />
          <Tip color="orange">
            <strong>Use a lambda comparator for complex sorts.</strong> The comparator must be a strict weak ordering: irreflexive, asymmetric, transitive. Returning <code>true</code> for equal elements is undefined behavior.
          </Tip>
        </Card>

        {/* 03 Searching */}
        <Card title="Searching" num="03" color="orange" size="md">
          <CodeBlock code={c_searching} />
          <InfoTable rows={[
            { key: "find / find_if",   value: "Linear O(n). find_if takes a predicate. Both return end() if not found." },
            { key: "binary_search",    value: "O(log n) on sorted range. Returns bool only — use lower_bound to get the position." },
            { key: "lower_bound",      value: "First element >= value. Use to find insertion point in a sorted range." },
            { key: "equal_range",      value: "Returns [lower, upper) pair — all elements equal to value. std::distance gives the count." },
            { key: "std::clamp",       value: "Returns lo if x < lo, hi if x > hi, else x. Replaces std::max(lo, std::min(x, hi))." },
          ]} />
        </Card>

        {/* 04 Transform & Fill */}
        <Card title="Transform · Fill · Generate · Replace" num="04" color="orange" size="md">
          <CodeBlock code={c_transform} />
          <InfoTable rows={[
            { key: "transform",    value: "Maps each element through a function into an output range. Output range must be pre-sized." },
            { key: "for_each",     value: "Like transform but for side effects — use a reference parameter to modify in-place." },
            { key: "generate",     value: "Fills a range by calling a generator function repeatedly. Great for sequences and test data." },
            { key: "replace_if",   value: "Replaces elements matching a predicate. Simpler than transform when just replacing values." },
          ]} />
        </Card>

        {/* 05 Reordering */}
        <Card title="Reordering" num="05" color="orange" size="md">
          <CodeBlock code={c_reorder} />
          <InfoTable rows={[
            { key: "rotate",     value: "Rotates elements left so that v.begin()+n becomes the new first. Returns the new position of the old first element." },
            { key: "shuffle",    value: "Uniformly random permutation. Always pass a seeded std::mt19937 — rand() is not uniform." },
            { key: "partition",  value: "Reorders so matching elements come first. Returns iterator to first non-matching. Not stable." },
            { key: "unique",     value: "Removes consecutive duplicates. Must sort first to remove all. Returns new logical end — erase to shrink." },
          ]} />
        </Card>

        {/* 06 Numeric */}
        <Card title="Numeric Algorithms" num="06" color="orange" size="md">
          <CodeBlock code={c_numeric} />
          <InfoTable rows={[
            { key: "accumulate",       value: "Sequential fold — applies binary op left-to-right. Start value is required and sets the result type." },
            { key: "iota",             value: "Fills range with val, val+1, val+2, ... Essential for generating index sequences." },
            { key: "partial_sum",      value: "Prefix sum — element i of output is sum of input[0..i]. Use for cumulative distributions." },
            { key: "reduce (C++17)",   value: "Like accumulate but order of operations is unspecified — enables parallel execution with execution policies." },
          ]} />
        </Card>

        {/* 07 C++20 Ranges */}
        <Card title="C++20 Ranges & Views" num="07" color="orange" size="md">
          <CodeBlock code={c_ranges} />
          <InfoTable rows={[
            { key: "ranges::sort(v)",    value: "No begin/end needed — takes the container directly. Cleaner call sites." },
            { key: "views::filter",      value: "Lazy — only evaluates elements when iterated. No intermediate container." },
            { key: "views::transform",   value: "Lazy map. Compose with | to build pipelines without allocating." },
            { key: "views::iota",        value: "Generates an infinite (or finite) sequence. Combine with take to limit." },
            { key: "pipe operator |",    value: "Composes views left-to-right. Each stage is lazy — the entire pipeline runs in one pass." },
          ]} />
          <Tip color="orange">
            <strong>Ranges views are zero-cost abstractions.</strong> A filter | transform pipeline iterates the data exactly once and allocates no intermediate containers — equivalent to a hand-written loop with an if-statement inside.
          </Tip>
        </Card>

      </div>
    </>
  );
}

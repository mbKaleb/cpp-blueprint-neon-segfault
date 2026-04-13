import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_decay = `\
// Arrays silently decay to a pointer to their first element
int arr[5] = {10, 20, 30, 40, 50};

int* p = arr;          // arr decays to &arr[0]
p[0];                  // 10 — pointer indexing works like array indexing
*(p + 2);              // 30 — pointer arithmetic

// What is LOST when an array decays:
sizeof(arr)            // 20 — correct: 5 × 4 bytes (array type known)
sizeof(p)              // 8  — wrong: just the pointer size!

void print(int* arr, int n) { }   // size info gone — must pass n
// or: void print(int (&arr)[5])  // reference to array — size preserved

// ── The classic bug ──────────────────────────────────────────
void init(int arr[10]) {          // looks like it takes an array...
  sizeof(arr);                    // ❌ 8 — arr is actually int*!
}
// Fix: use std::array or pass by reference
void init(std::array<int,10>& arr) { sizeof(arr); }  // ✅ 40`;

const c_stdarray = `\
#include <array>

// std::array — fixed size, stack allocated, no decay
std::array<int, 5> a = {10, 20, 30, 40, 50};

a.size()      // 5  — always correct, no decay
a[2]          // 30 — unchecked (UB on out-of-bounds)
a.at(2)       // 30 — checked (throws std::out_of_range)
a.front()     // 10
a.back()      // 50
a.data()      // raw int* pointer to first element

// Works with standard algorithms
std::sort(a.begin(), a.end());
std::fill(a.begin(), a.end(), 0);

// Comparison operators work element-wise
std::array<int,3> x{1,2,3}, y{1,2,4};
x < y;   // true

// Structured bindings (C++17)
auto [first, second, rest] = std::array<int,3>{1,2,3};
// (binds all three elements)

// Pass by ref — size is part of the type
void process(std::array<int,5>& arr) { }`;

const c_2d = `\
// ── C-style 2D array ─────────────────────────────────────────
int grid[3][4] = {
  {1, 2, 3, 4},
  {5, 6, 7, 8},
  {9,10,11,12},
};
grid[1][2];   // 7 — row 1, col 2
// Memory layout: row-major — row 0 then row 1 then row 2

// Passing 2D arrays — column count must be known
void print(int arr[][4], int rows) { }  // ✅
// void print(int arr[][], int rows) {} // ❌ compiler needs column count

// ── std::array 2D ────────────────────────────────────────────
std::array<std::array<int,4>, 3> grid2;
grid2[1][2] = 7;

// ── Vector of vectors (dynamic 2D) ───────────────────────────
std::vector<std::vector<int>> mat(3, std::vector<int>(4, 0));
mat[1][2] = 7;

// ── Flat array (most cache-friendly) ─────────────────────────
std::vector<int> flat(3 * 4, 0);
flat[1 * 4 + 2] = 7;   // row*cols + col`;

const c_ptrarith = `\
int arr[5] = {10, 20, 30, 40, 50};
int* p = arr;   // p → arr[0]

// Pointer arithmetic — moves by sizeof(int) bytes
p + 1           // → arr[1]
p + 3           // → arr[3]
*(p + 3)        // 40
p[3]            // 40 — exactly equivalent to *(p+3)

// Pointer difference — result is ptrdiff_t (signed)
int* q = &arr[4];
q - p           // 4 (number of elements between them)

// Increment / decrement
p++;            // p now points to arr[1]
p--;            // p back to arr[0]

// Iterating with a pointer
for (int* it = arr; it != arr + 5; ++it) {
  std::cout << *it << " ";
}

// Past-the-end pointer is valid to form but not to dereference
int* end = arr + 5;   // ✅ valid
*end;                  // ❌ UB — past the end`;

const c_size = `\
// ── Getting array size ───────────────────────────────────────
int arr[5] = {1,2,3,4,5};

// C-style (error-prone — only works on actual arrays, not pointers)
int n = sizeof(arr) / sizeof(arr[0]);   // 5

// C++17: std::size() — works on arrays and containers
#include <iterator>
std::size(arr)   // 5 — preferred

// std::array: always correct
std::array<int,5> a;
a.size()         // 5

// ── Initialization forms ─────────────────────────────────────
int a1[5] = {};            // all zeros
int a2[5] = {1, 2};        // {1, 2, 0, 0, 0} — rest zero-initialized
int a3[] = {1, 2, 3};      // size deduced: 3 elements
// int a4[3] = {1,2,3,4};  // ❌ too many initializers — compile error

// ── VLAs — variable-length arrays ───────────────────────────
// NOT standard C++ (C99 extension, supported by GCC/Clang with warning)
int n = 10;
int vla[n];   // ❌ avoid — stack overflow risk, not portable
// Use std::vector<int>(n) instead`;

const c_comparison = `\
//                   C array    std::array    std::vector
// Size fixed?         ✅ yes      ✅ yes         ❌ no
// Size in type?       ❌ no       ✅ yes         ❌ no
// Stack allocated?    ✅ yes      ✅ yes         ❌ heap
// Bounds checking?    ❌ no       .at() only     .at() only
// Decays to ptr?      ✅ yes      ❌ no           ❌ no
// Algorithms?         manual    ✅ begin/end    ✅ begin/end
// Copy/assign?        ❌ no       ✅ yes          ✅ yes
// Default construct?  partial    ✅ yes          ✅ yes

// Rule of thumb:
// Compile-time fixed size, small, stack: std::array
// Runtime size or grows/shrinks:         std::vector
// Interfacing with C APIs:               C array or .data()
// Never:                                 C array in new code unless forced`;

// ── Page component ──────────────────────────────────────────────────────────

export default function ArraysPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Arrays in C++" num="01" color="red" size="lg">
          <Prose>
            <H3>C arrays vs std::array</H3>
            <P>
              C-style arrays are a low-level feature inherited from C. They are fixed-size, stack-allocated,
              and extremely fast — but they <Code>decay</Code> to pointers, losing all size information.
              <Code>std::array</Code> (C++11) wraps a C array with a proper type, preserving size and
              enabling standard algorithms with zero runtime overhead.
            </P>
            <Grid>
              <Cell>
                <H3>C array dangers</H3>
                <OL>
                  <LI>No bounds checking — out-of-bounds access is undefined behavior with no error.</LI>
                  <LI>Decays to <Code>int*</Code> when passed to a function — size is silently lost.</LI>
                  <LI><Code>sizeof(arr)</Code> returns the wrong value after decay — a pointer size.</LI>
                  <LI>Cannot be assigned, copied, or compared with <Code>==</Code>.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>std::array advantages</H3>
                <OL>
                  <LI>Size is part of the type — <Code>array&lt;int,5&gt;</Code> and <Code>array&lt;int,6&gt;</Code> are different types.</LI>
                  <LI>No decay — passes by reference with full type information.</LI>
                  <LI>Works with all standard algorithms via <Code>begin()</Code> / <Code>end()</Code>.</LI>
                  <LI>Supports copy, assignment, and lexicographic comparison out of the box.</LI>
                </OL>
                <Note>std::array has zero runtime overhead — it compiles to the same code as a C array.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Array Decay */}
        <Card title="Array Decay" num="02" color="red" size="md">
          <CodeBlock code={c_decay} />
          <InfoTable rows={[
            { key: "arr → int*",       value: "Arrays decay to a pointer to their first element in almost every context: assignment, function call, most expressions." },
            { key: "sizeof after decay", value: "sizeof(ptr) is 8 (pointer size) — not the array size. Only sizeof on the original array name gives the right answer." },
            { key: "int arr[10] param", value: "Function parameters declared as int arr[] or int arr[10] are silently rewritten to int* arr by the compiler." },
            { key: "reference prevents decay", value: "int (&arr)[5] — a reference to an array of exactly 5 ints. Size is preserved. Use std::array instead." },
          ]} />
          <Tip color="red">
            <strong>Decay is a source of silent bugs.</strong> Prefer <code>std::array</code> for fixed-size collections — it never decays, so <code>sizeof</code> and size() always give the right answer.
          </Tip>
        </Card>

        {/* 03 std::array */}
        <Card title="std::array (C++11)" num="03" color="red" size="md">
          <CodeBlock code={c_stdarray} />
          <InfoTable rows={[
            { key: "a[i]",    value: "Unchecked access — undefined behavior if i >= size(). Fast." },
            { key: "a.at(i)", value: "Checked access — throws std::out_of_range if i >= size(). Use during development." },
            { key: "a.data()", value: "Returns a raw pointer to the underlying array. Use when a C API needs int*." },
            { key: "size in type", value: "array<int,5> and array<int,6> are different types — the compiler catches size mismatches." },
          ]} />
        </Card>

        {/* 04 2D Arrays */}
        <Card title="Multidimensional Arrays" num="04" color="red" size="md">
          <CodeBlock code={c_2d} />
          <InfoTable rows={[
            { key: "C 2D array",      value: "Laid out row-major in memory. Pass with fixed column count: int arr[][4]." },
            { key: "array of arrays", value: "std::array<std::array<int,4>,3> — fully typed, no decay, size in type." },
            { key: "vector of vectors", value: "Dynamic, jagged rows possible. Each row is a separate heap allocation — poor cache locality." },
            { key: "flat vector",     value: "Single allocation, row-major. Best cache performance. Access with [row*cols+col]." },
          ]} />
          <Tip color="red">
            <strong>For performance-critical 2D data, use a flat <code>vector&lt;T&gt;</code>.</strong> A vector-of-vectors means N separate heap allocations and pointer chasing on every row access. A flat array is one allocation and sequential memory.
          </Tip>
        </Card>

        {/* 05 Pointer Arithmetic */}
        <Card title="Pointer Arithmetic" num="05" color="red" size="md">
          <CodeBlock code={c_ptrarith} />
          <InfoTable rows={[
            { key: "p + n",    value: "Advances p by n elements (not bytes). The compiler scales by sizeof(*p) automatically." },
            { key: "p - q",    value: "Number of elements between two pointers. Type is ptrdiff_t (signed)." },
            { key: "p[n]",     value: "Exactly equivalent to *(p+n). Array indexing is defined in terms of pointer arithmetic." },
            { key: "past-end", value: "arr + size is a valid pointer to form (for comparisons) but must never be dereferenced." },
          ]} />
        </Card>

        {/* 06 Size & Init */}
        <Card title="Size, Init & VLAs" num="06" color="red">
          <CodeBlock code={c_size} />
          <Tip color="red">
            <strong>Never use VLAs.</strong> Variable-length arrays are a GCC/Clang extension, not standard C++. Large VLAs silently overflow the stack. Use <code>std::vector&lt;int&gt;(n)</code> instead.
          </Tip>
        </Card>

        {/* 07 Comparison */}
        <Card title="C array vs std::array vs vector" num="07" color="red" size="md">
          <CodeBlock code={c_comparison} />
          <InfoTable rows={[
            { key: "C array",     value: "Use only when interfacing with C APIs that require raw pointers. Avoid in new C++ code." },
            { key: "std::array",  value: "Prefer for any fixed-size collection. Zero overhead over C array, full C++ type system." },
            { key: "std::vector", value: "Prefer when size is unknown at compile time or the collection grows. Heap allocated." },
          ]} />
        </Card>

      </div>
    </>
  );
}

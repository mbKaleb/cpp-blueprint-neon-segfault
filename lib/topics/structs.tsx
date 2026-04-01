import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_basics = `\
struct Point {
  double x;
  double y;
};

// ── Initialization ───────────────────────────────────────────
Point a = {1.0, 2.0};          // aggregate init — in declaration order
Point b{3.0, 4.0};             // brace init (C++11) — preferred
Point c = {.x = 1.0, .y = 2.0}; // designated initializers (C++20)
Point d{};                      // zero-initialized: {0.0, 0.0}
Point e;                        // ⚠ members are indeterminate (local struct)

// ── Access ───────────────────────────────────────────────────
a.x = 10.0;
a.y = 20.0;

Point* ptr = &a;
ptr->x;        // 10.0  — arrow operator: dereference + access
(*ptr).x;      // 10.0  — equivalent but more verbose

// ── Struct with default member values (C++11) ────────────────
struct Config {
  int port     = 8080;
  bool ssl     = false;
  std::string host = "localhost";
};
Config cfg;            // all defaults
Config cfg2{9090};     // port=9090, rest default`;

const c_methods = `\
struct Rectangle {
  double width;
  double height;

  // Member functions — structs can have methods (like classes)
  double area() const {
    return width * height;
  }
  double perimeter() const {
    return 2 * (width + height);
  }

  // Modify members
  void scale(double factor) {
    width  *= factor;
    height *= factor;
  }

  // Static member function — no 'this' pointer
  static Rectangle square(double side) {
    return {side, side};
  }
};

Rectangle r{4.0, 3.0};
r.area();         // 12.0
r.scale(2.0);     // width=8, height=6
Rectangle::square(5.0);   // {5.0, 5.0}`;

const c_memory = `\
// ── Struct layout — members stored in declaration order ──────
struct Packed {
  char   a;    // 1 byte
  int    b;    // 4 bytes — but starts at offset 4 (3 bytes padding!)
  char   c;    // 1 byte
  // 3 bytes padding at end (struct size must be multiple of alignment)
};
sizeof(Packed);   // 12 — not 6!

// ── Reorder to minimize padding ──────────────────────────────
struct Tight {
  int    b;    // 4 bytes at offset 0
  char   a;    // 1 byte at offset 4
  char   c;    // 1 byte at offset 5
  // 2 bytes padding
};
sizeof(Tight);    // 8 — not 12

// ── alignof — alignment requirement ─────────────────────────
alignof(Packed);  // 4 (int's alignment requirement dominates)

// ── #pragma pack / __attribute__((packed)) — force no padding
// ⚠ Accessing misaligned members is UB on some architectures
struct [[gnu::packed]] Wire { char a; int b; };  // size = 5`;

const c_special = `\
struct Vec2 {
  double x, y;

  // Constructor (not needed for aggregates, but adds validation)
  Vec2(double x, double y) : x(x), y(y) {}

  // Copy constructor (compiler generates one automatically)
  Vec2(const Vec2&) = default;

  // Move constructor (C++11)
  Vec2(Vec2&&) = default;

  // Copy assignment
  Vec2& operator=(const Vec2&) = default;

  // Destructor (compiler generates: does nothing for trivial types)
  ~Vec2() = default;

  // Comparison (C++20: default generates == and <=>)
  auto operator<=>(const Vec2&) const = default;

  // Arithmetic
  Vec2 operator+(const Vec2& o) const { return {x+o.x, y+o.y}; }
  Vec2& operator+=(const Vec2& o) { x+=o.x; y+=o.y; return *this; }
};

// Rule of Zero: if you don't manage resources, don't define
// any of the special members — let the compiler generate them`;

const c_aggregate = `\
// Aggregate: no user-provided constructors, no private/protected
// non-static members, no virtual functions, no base classes (C++17)
// → supports aggregate initialization and structured bindings

struct Color { uint8_t r, g, b, a = 255; };
Color red   = {255, 0, 0};         // a defaults to 255
Color green = {.r=0,.g=255,.b=0};  // C++20 designated init

// ── Structured bindings decompose aggregates (C++17) ─────────
auto [r, g, b, a] = red;

// ── Returning multiple values — use struct ───────────────────
struct MinMax { int min, max; };

MinMax findMinMax(const std::vector<int>& v) {
  return { *std::min_element(v.begin(),v.end()),
           *std::max_element(v.begin(),v.end()) };
}
auto [lo, hi] = findMinMax(data);

// vs std::pair (less readable field names)
// vs std::tuple (even less readable)
// vs out parameters (awkward call syntax)`;

const c_vs_class = `\
//                struct                   class
// Default access  public                   private
// Inheritance     public by default        private by default
// Usage style     data bundles, POD types  encapsulated objects

// ── When to use struct ───────────────────────────────────────
// ✅ Simple data bundles with all public members
// ✅ POD (plain old data) types for C interop, serialization
// ✅ Return-value aggregates (MinMax, ParseResult)
// ✅ Policy/tag types passed as template parameters

// ── When to use class ────────────────────────────────────────
// ✅ Types with invariants to protect (bank account balance)
// ✅ Types that manage resources (file handle, mutex, buffer)
// ✅ Types with significant interface and implementation split

// ── POD (trivial + standard-layout) ─────────────────────────
// Trivial: compiler-generated special members, no virtual functions
// Standard-layout: all members same access, no virtual, C-compatible
#include <type_traits>
std::is_trivial_v<Point>           // true
std::is_standard_layout_v<Point>   // true
std::is_pod_v<Point>               // true (deprecated C++20)`;

// ── Page component ──────────────────────────────────────────────────────────

export default function StructsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Structs in C++" num="01" color="green" size="lg">
          <Prose>
            <H3>Structs as value types</H3>
            <P>
              A <Code>struct</Code> groups related data under one name. In C++, structs are nearly
              identical to classes — the only difference is default member access (<Code>public</Code>
              in structs, <Code>private</Code> in classes). Structs are idiomatically used for simple
              data bundles and plain-old-data (POD) types.
            </P>
            <Grid>
              <Cell>
                <H3>Key facts</H3>
                <OL>
                  <LI>Members are stored in declaration order in memory.</LI>
                  <LI>The compiler inserts padding between members to satisfy alignment requirements — struct size may be larger than the sum of member sizes.</LI>
                  <LI>Structs with only public data and no user-provided constructors are <Code>aggregates</Code> — they support brace initialization directly.</LI>
                  <LI>C++20 designated initializers (<Code>.field = value</Code>) make aggregate init self-documenting.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Initialization rules</H3>
                <OL>
                  <LI>Local struct without init: members are indeterminate — use <Code>{"{}"}</Code> to zero-initialize.</LI>
                  <LI>Static / global struct: zero-initialized automatically.</LI>
                  <LI>Default member values (C++11) apply when no initializer is provided for that member.</LI>
                  <LI>Brace init checks for narrowing conversions — prefer over parenthesis init.</LI>
                </OL>
                <Note>Rule of Zero: if a struct only holds value-type members (ints, strings, vectors), define no special members — the compiler generates correct copy, move, and destruction automatically.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Basics */}
        <Card title="Definition, Init & Access" num="02" color="green" size="md">
          <CodeBlock code={c_basics} />
          <InfoTable rows={[
            { key: "Point{}",             value: "Value-initializes all members to zero. Always prefer over Point() for aggregates." },
            { key: "ptr->x",              value: "Arrow operator — dereferences and accesses in one step. Equivalent to (*ptr).x." },
            { key: "= default values",    value: "C++11: member default values apply when the member has no initializer in the constructor/aggregate init." },
            { key: "designated init",     value: "C++20: .field = value syntax. Out-of-order fields not allowed — must match declaration order." },
          ]} />
        </Card>

        {/* 03 Member Functions */}
        <Card title="Member Functions" num="03" color="green" size="md">
          <CodeBlock code={c_methods} />
          <InfoTable rows={[
            { key: "const method",    value: "Cannot modify data members. Should be applied to any method that is logically read-only." },
            { key: "static method",   value: "No this pointer — called on the type, not an instance. Use for factory functions and utilities." },
            { key: "struct vs class", value: "Structs can have full member functions, constructors, and operators — they're identical to classes except for default access." },
          ]} />
        </Card>

        {/* 04 Memory Layout */}
        <Card title="Memory Layout & Padding" num="04" color="green" size="md">
          <CodeBlock code={c_memory} />
          <InfoTable rows={[
            { key: "padding",          value: "Bytes inserted between members so each member starts at its natural alignment. May add 30–50% to struct size." },
            { key: "reorder trick",    value: "Sort members largest to smallest to minimize padding. Biggest alignment requirement first." },
            { key: "alignof(T)",       value: "The alignment requirement of T — the address must be a multiple of this value." },
            { key: "packed attribute", value: "Removes padding — struct is as small as possible. Misaligned access is UB on some CPUs (ARM). Use with care." },
          ]} />
          <Tip color="green">
            <strong>Declare members largest-to-smallest.</strong> Put <code>double</code> and <code>int64_t</code> first, <code>int</code> next, <code>char</code> last. This often eliminates all padding and shrinks the struct.
          </Tip>
        </Card>

        {/* 05 Special Members */}
        <Card title="Special Member Functions" num="05" color="green" size="md">
          <CodeBlock code={c_special} />
          <InfoTable rows={[
            { key: "= default",      value: "Explicitly ask the compiler to generate the default implementation. Clearer than omitting it." },
            { key: "= delete",       value: "Explicitly disable a special member — e.g., = delete on copy constructor to make type move-only." },
            { key: "Rule of Zero",   value: "If you don't manage a resource, define none of the 5 special members — the compiler's versions are correct." },
            { key: "Rule of Five",   value: "If you define any one of destructor/copy/move, define all five — they interact in non-obvious ways." },
          ]} />
        </Card>

        {/* 06 Aggregates & Multiple Return */}
        <Card title="Aggregates & Returning Multiple Values" num="06" color="green" size="md">
          <CodeBlock code={c_aggregate} />
          <InfoTable rows={[
            { key: "aggregate",         value: "No user-provided constructors, all public members — supports brace init and structured bindings directly." },
            { key: "struct for returns", value: "Returning a named struct is clearer than pair<int,int> — callers know what each field means." },
            { key: "auto [a, b] = s",   value: "Structured bindings decompose any aggregate in declaration order." },
          ]} />
        </Card>

        {/* 07 struct vs class */}
        <Card title="struct vs class & POD" num="07" color="green" size="md">
          <CodeBlock code={c_vs_class} />
          <InfoTable rows={[
            { key: "struct default",   value: "Members and base classes are public by default." },
            { key: "class default",    value: "Members and base classes are private by default." },
            { key: "POD type",         value: "Trivial + standard-layout. Compatible with C memcpy, serialization, and binary protocols." },
            { key: "is_trivial_v<T>",  value: "True if T has trivial (compiler-generated) special members and no virtual functions." },
          ]} />
        </Card>

      </div>
    </>
  );
}

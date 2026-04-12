import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_integers = `\
// Signed integers (can hold negative values)
short           s  = 32767;          // 16-bit  ±32 767
int             i  = 2147483647;     // 32-bit  ±2.1 × 10⁹
long            l  = 2147483647L;    // 32-bit on most 64-bit systems
long long       ll = 9223372036854775807LL; // 64-bit ±9.2 × 10¹⁸

// Unsigned integers (non-negative only, double the positive range)
unsigned int    u  = 4294967295u;    // 32-bit  0 – 4.3 × 10⁹
unsigned long long ull = 18446744073709551615ULL;

// Fixed-width types (always the same size — prefer these)
#include <cstdint>
int8_t   a = 127;          int16_t  b = 32767;
int32_t  c = 2147483647;   int64_t  d = 9223372036854775807LL;
uint8_t  e = 255;          uint32_t f = 4294967295u;

// Size-semantic types
size_t    n = sizeof(int);   // result of sizeof — always unsigned
ptrdiff_t p = ptr2 - ptr1;  // difference between pointers — signed`;

const c_floats = `\
float       f  = 3.14f;          // 32-bit  ~7 decimal digits
double      d  = 3.14159265358;  // 64-bit  ~15 decimal digits  ← default
long double ld = 3.14159265358L; // 80 or 128-bit (platform-dependent)

// Literal suffixes
1.0f    // float
1.0     // double (default)
1.0L    // long double

// Special values (from <cmath> / <limits>)
#include <limits>
double inf  = std::numeric_limits<double>::infinity();
double nan  = std::numeric_limits<double>::quiet_NaN();
double eps  = std::numeric_limits<double>::epsilon(); // ~2.2e-16

// Checking for special values
#include <cmath>
std::isinf(x);   std::isnan(x);   std::isfinite(x);

// Pitfall: floating-point comparison
double a = 0.1 + 0.2;
a == 0.3;              // ❌ false! (binary representation error)
std::abs(a - 0.3) < 1e-9;  // ✅ use epsilon comparison`;

const c_chars = `\
char     c1 = 'A';      // 8-bit, may be signed or unsigned
wchar_t  c2 = L'Ω';    // wide char — 16-bit (Windows) or 32-bit (Linux)
char8_t  c3 = u8'a';   // C++20: UTF-8 code unit
char16_t c4 = u'α';    // UTF-16 code unit
char32_t c5 = U'😀';  // UTF-32 code point (always 32-bit)

// Common escape sequences
'\\n'  // newline       '\\t'  // tab
'\\r'  // carriage return '\\\\'  // backslash
'\\0'  // null term.    '\\''  // single quote

// char arithmetic (chars are just small integers)
char ch = 'A';
ch + 1;          // 66 — arithmetic promotes to int
(char)(ch + 1);  // 'B' — cast back to char
std::isalpha(ch); std::toupper(ch);  // <cctype>`;

const c_auto = `\
// auto — compiler deduces type from initializer
auto x    = 42;          // int
auto y    = 3.14;        // double
auto z    = 3.14f;       // float
auto s    = "hello";     // const char*
auto str  = std::string{"hello"}; // std::string

// auto strips top-level const/reference — add them back explicitly
const auto ci = 42;       // const int
auto& r = someVector;     // reference to someVector's type
const auto& cr = vec;     // const reference

// decltype — type of an expression without evaluating it
int a = 5;
decltype(a)   b = 10;    // int
decltype(a+b) c = 15;    // int (result type of a+b)

// decltype(auto) — preserves references and const (C++14)
decltype(auto) ref = getRef();  // keeps reference if getRef() returns one

// Trailing return type (useful for templates)
auto add(int a, int b) -> int { return a + b; }`;

const c_conversions = `\
// Implicit promotions (safe — no data loss)
char   → int → long → long long → float → double → long double

// Narrowing (unsafe — may lose data, compiler warns with -Wall)
double d = 3.99;
int    i = d;          // i = 3 (truncated, not rounded)
int    j = 300;
char   c = j;          // implementation-defined (likely truncated)

// Explicit casts
static_cast<int>(3.9)         // 3   — safe, compile-time checked
static_cast<double>(5) / 2    // 2.5 — int → double before division
reinterpret_cast<char*>(&i)   // raw memory reinterpretation
const_cast<int*>(cptr)        // remove const (use sparingly)

// Pitfall: integer overflow (undefined behavior for signed types)
int max = std::numeric_limits<int>::max();
max + 1;   // ❌ undefined behavior — signed overflow is UB
// Use unsigned if you need wrapping: uint32_t wraps predictably`;

const c_literals = `\
// Integer literal prefixes
255    // decimal
0377   // octal (leading zero)
0xFF   // hexadecimal
0b1111'1111  // binary (C++14)

// Digit separator (C++14) — readability only, no semantic meaning
1'000'000    // one million
0xFF'FF'FF   // 24-bit color
0b1010'1010  // byte with visual grouping

// Integer literal suffixes
42u    // unsigned int
42L    // long
42LL   // long long
42ULL  // unsigned long long

// String literals
"hello"         // const char[]
L"hello"        // const wchar_t[]
u8"hello"       // const char8_t[] (UTF-8)
u"hello"        // const char16_t[]
U"hello"        // const char32_t[]
R"(raw\nstring)" // raw string — backslashes are literal`;

const c_traits = `\
#include <type_traits>

// Query types at compile time
std::is_integral_v<int>         // true
std::is_floating_point_v<float> // true
std::is_same_v<int, int32_t>    // platform-dependent!
std::is_signed_v<unsigned int>  // false
std::is_const_v<const int>      // true
std::is_pointer_v<int*>         // true
std::is_reference_v<int&>       // true

// Transform types
std::remove_const_t<const int>   // int
std::remove_reference_t<int&>    // int
std::add_pointer_t<int>          // int*
std::make_unsigned_t<int>        // unsigned int
std::decay_t<const int&>         // int (mimics pass-by-value)

// Use in if constexpr (see Program Structure topic)
template<typename T>
void print(T val) {
  if constexpr (std::is_integral_v<T>)
    std::cout << "int: " << val;
  else if constexpr (std::is_floating_point_v<T>)
    std::cout << "float: " << val;
}`;

// ── Page component ──────────────────────────────────────────────────────────

export default function DataTypesPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Type System Overview */}
        <Card title="The C++ Type System" num="01" color="orange" size="lg">
          <Prose>
            <H3>Two categories of types</H3>
            <P>
              C++ types divide into <Code>fundamental</Code> (built into the language) and <Code>compound</Code> (built
              from fundamentals — pointers, references, arrays, functions, classes). Every expression has a type
              known at compile time.
            </P>
            <Grid>
              <Cell>
                <H3>Fundamental</H3>
                <OL>
                  <LI>Integer types — <Code>int</Code>, <Code>short</Code>, <Code>long</Code>, <Code>long long</Code>, unsigned variants</LI>
                  <LI>Floating-point — <Code>float</Code>, <Code>double</Code>, <Code>long double</Code></LI>
                  <LI>Character — <Code>char</Code>, <Code>wchar_t</Code>, <Code>char8_t</Code>, <Code>char16_t</Code>, <Code>char32_t</Code></LI>
                  <LI>Boolean — <Code>bool</Code> (<Code>true</Code> / <Code>false</Code>)</LI>
                  <LI>Void — <Code>void</Code> (no value; used for functions and pointers)</LI>
                  <LI><Code>std::nullptr_t</Code> — type of the literal <Code>nullptr</Code></LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Key rules</H3>
                <OL>
                  <LI>The standard only specifies minimum sizes — use <Code>&lt;cstdint&gt;</Code> fixed-width types when exact size matters</LI>
                  <LI><Code>sizeof(char) == 1</Code> always; everything else is implementation-defined</LI>
                  <LI>Signed integer overflow is <Code>undefined behavior</Code> — unsigned overflow wraps</LI>
                  <LI><Code>bool</Code> is an integer type — <Code>true</Code> converts to 1, <Code>false</Code> to 0</LI>
                  <LI>Floating-point arithmetic is not exact — never use <Code>==</Code> to compare doubles</LI>
                  <LI>Prefer <Code>auto</Code> for local variables; it can't be left uninitialized</LI>
                </OL>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Integer Types */}
        <Card title="Integer Types" num="02" color="orange" size="md">
          <CodeBlock code={c_integers} />
          <InfoTable rows={[
            { key: "int8_t / uint8_t",   value: "Exactly 8 bits. uint8_t is often used as a byte alias." },
            { key: "int32_t / uint32_t",  value: "Exactly 32 bits. Prefer over plain int when size matters." },
            { key: "size_t",              value: "Unsigned type for object sizes and array indices. Use for loop counters over containers." },
            { key: "ptrdiff_t",           value: "Signed type for pointer arithmetic results." },
          ]} />
        </Card>

        {/* 03 Floating-Point */}
        <Card title="Floating-Point Types" num="03" color="yellow" size="md">
          <CodeBlock code={c_floats} />
          <Tip color="orange" > {/*type TipColor = "cyan" | "orange" | "purple" | "green" | "red"; */}
            <strong>Default to double.</strong> <code>float</code> saves memory but has only ~7 digits of precision — enough for graphics, not for financial or scientific work. <code>long double</code> is 80-bit on x86 but only 64-bit on MSVC and ARM.
          </Tip>
        </Card>

        {/* 04 Character Types */}
        <Card title="Character Types" num="04" color="purple">
          <CodeBlock code={c_chars} />
          <Tip color="purple">
            <strong>Signedness of char is implementation-defined.</strong> If you need a small integer, use <code>signed char</code> or <code>unsigned char</code> explicitly. Use <code>char</code> only for characters.
          </Tip>
        </Card>

        {/* 05 auto & decltype */}
        <Card title="auto & decltype" num="05" color="cyan" size="md">
          <CodeBlock code={c_auto} />
          <InfoTable rows={[
            { key: "auto",          value: "Deduces type from initializer. Strips top-level const and references." },
            { key: "const auto",    value: "Deduced type + const. Use for values you won't modify." },
            { key: "auto&",         value: "Deduced type + reference. Avoids copies in range-for loops." },
            { key: "decltype(x)",   value: "Type of expression x, without evaluating it. Preserves refs and const." },
            { key: "decltype(auto)", value: "Like auto but preserves reference and const — useful for forwarding return types." },
          ]} />
        </Card>

        {/* 06 Implicit Conversions */}
        <Card title="Conversions & Casts" num="06" color="red" size="md">
          <CodeBlock code={c_conversions} />
          <Tip color="red">
            <strong>Prefer <code>static_cast</code> over C-style casts.</strong> C-style <code>(int)x</code> silently tries <code>static_cast</code>, <code>reinterpret_cast</code>, and <code>const_cast</code> in order — you lose control over which one fires.
          </Tip>
        </Card>

        {/* 07 Literals */}
        <Card title="Literals & Suffixes" num="07" color="green">
          <SectionLabel>Prefixes &amp; Suffixes</SectionLabel>
          <CodeBlock code={c_literals} />
        </Card>

        {/* 08 Type Traits */}
        <Card title="Type Traits (C++17)" num="08" color="cyan" size="md">
          <CodeBlock code={c_traits} />
          <InfoTable rows={[
            { key: "is_integral_v<T>",      value: "True for bool, char, short, int, long, long long, and their unsigned/signed variants." },
            { key: "is_same_v<T, U>",       value: "True only if T and U are exactly the same type — cv-qualifiers matter." },
            { key: "decay_t<T>",            value: "Mimics pass-by-value decay: removes ref, const, converts arrays to pointers." },
            { key: "conditional_t<B,T,F>",  value: "Type alias for T if B is true, F otherwise — compile-time ternary for types." },
          ]} />
        </Card>

      </div>
    </>
  );
}

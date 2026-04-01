import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_arithmetic = `\
// ── Integer arithmetic pitfalls ─────────────────────────────
5 / 2          // 2  — integer division truncates toward zero
-7 / 2         // -3 — truncates toward zero (C++11 guaranteed)
5 % 2          // 1
-7 % 2         // -1 — sign of result matches dividend (C++11)

// Force floating-point division
static_cast<double>(5) / 2   // 2.5
5 / 2.0                      // 2.5  (one double → both promoted)

// ── Overflow (undefined behavior for signed types) ───────────
int max = std::numeric_limits<int>::max();  // 2147483647
max + 1;    // ❌ UB — signed overflow; use unsigned or check first

unsigned int u = 0;
u - 1;      // 4294967295 — unsigned wraps predictably (well-defined)

// ── Pre vs post increment ────────────────────────────────────
int a = 5;
int b = a++;   // b=5, a=6  (post: use then increment)
int c = ++a;   // c=7, a=7  (pre:  increment then use)
// Prefer ++i over i++ — avoids creating a temporary copy`;

const c_bitwise = `\
// Bitwise operators work on each bit independently
unsigned int a = 0b1100;   // 12
unsigned int b = 0b1010;   // 10

a & b    // 0b1000 =  8   AND  — bit set in BOTH
a | b    // 0b1110 = 14   OR   — bit set in EITHER
a ^ b    // 0b0110 =  6   XOR  — bit set in ONE but not both
~a       // 0b...0011 = ~12   NOT  — flip all bits

a << 1   // 0b11000 = 24  left shift  (multiply by 2)
a >> 1   // 0b0110  =  6  right shift (divide by 2, rounds down)

// ── Common bit tricks ────────────────────────────────────────
x |  (1 << n)   // set bit n
x & ~(1 << n)   // clear bit n
x ^  (1 << n)   // toggle bit n
(x >> n) & 1    // test bit n (1 if set, 0 if clear)
x & (x - 1)     // clear lowest set bit
x & (-x)        // isolate lowest set bit

// ── Bitmask flags (common pattern) ──────────────────────────
constexpr unsigned READ  = 1 << 0;  // 0b001
constexpr unsigned WRITE = 1 << 1;  // 0b010
constexpr unsigned EXEC  = 1 << 2;  // 0b100

unsigned perms = READ | WRITE;      // combine flags
bool canRead = (perms & READ) != 0; // test flag`;

const c_comparison = `\
// ── Comparison operators — all return bool ───────────────────
a == b    a != b    a < b    a > b    a <= b    a >= b

// ⚠ Signed / unsigned comparison — common silent bug
int  s = -1;
unsigned u = 1;
s < u;     // ❌ false! -1 converts to a huge unsigned number

// Fix: cast explicitly
static_cast<unsigned>(s) < u;   // still wrong if s is negative
s < static_cast<int>(u);        // correct — compare as signed

// ── Logical operators — short-circuit evaluation ─────────────
// && stops at first false; || stops at first true
bool result = (ptr != nullptr) && (ptr->value > 0);
//             ^^^^^^^^^^^^^^^^ if false, ptr->value never evaluated

// ── Three-way comparison / spaceship (C++20) ─────────────────
#include <compare>
auto cmp = a <=> b;
// Returns: std::strong_ordering::less / equal / greater
// Enables: auto-generated ==, !=, <, >, <=, >= for your type

struct Point {
  int x, y;
  auto operator<=>(const Point&) const = default;  // all 6 operators free
};`;

const c_other = `\
// ── sizeof — size in bytes, compile-time ─────────────────────
sizeof(int)         // 4 (on most platforms)
sizeof(double)      // 8
sizeof(char)        // 1 (always)
sizeof(arr)         // total bytes of array (NOT pointer size!)
sizeof(arr)/sizeof(arr[0])  // element count (prefer std::size())

// ── alignof — alignment requirement in bytes ─────────────────
alignof(double)     // 8 — must start at 8-byte boundary
alignof(char)       // 1

// ── Ternary operator ─────────────────────────────────────────
int abs_x = (x >= 0) ? x : -x;
std::string label = (score >= 90) ? "A" : (score >= 80) ? "B" : "C";

// ── Comma operator (rarely needed) ───────────────────────────
int a = (x = 5, x + 3);   // evaluates left, discards, returns right
// Common in for loops: for (int i=0, j=10; i<j; i++, j--)

// ── typeid — runtime type info ───────────────────────────────
#include <typeinfo>
typeid(x).name()        // implementation-defined string
typeid(x) == typeid(y)  // true if same type`;

const c_overload = `\
// Operator overloading — define operators for your types
struct Vec2 {
  double x, y;

  // Member operator — left operand is *this
  Vec2 operator+(const Vec2& rhs) const {
    return {x + rhs.x, y + rhs.y};
  }
  Vec2& operator+=(const Vec2& rhs) {
    x += rhs.x; y += rhs.y;
    return *this;   // return *this for chaining
  }

  // Comparison (C++20: just default the spaceship)
  auto operator<=>(const Vec2&) const = default;

  // Stream output — free function (not member) so cout is on the left
  friend std::ostream& operator<<(std::ostream& os, const Vec2& v) {
    return os << "(" << v.x << ", " << v.y << ")";
  }
};

Vec2 a{1,2}, b{3,4};
Vec2 c = a + b;      // {4, 6}
std::cout << c;      // (4, 6)`;

const c_precedence = `\
// Higher rows bind tighter (evaluated first)
// ── Tier 1 (tightest) ───── ::                    scope resolution
// ── Tier 2 ───────────────  a++  a--  ()  []  .  ->
// ── Tier 3 (unary) ────────  ++a  --a  +a  -a  !  ~  *  &  sizeof
// ── Tier 4 ────────────────  .*  ->*              pointer-to-member
// ── Tier 5 ────────────────  *  /  %              multiplicative
// ── Tier 6 ────────────────  +  -                 additive
// ── Tier 7 ────────────────  <<  >>               shift
// ── Tier 8 ────────────────  <=>                  three-way (C++20)
// ── Tier 9 ────────────────  <  <=  >  >=         relational
// ── Tier 10 ───────────────  ==  !=               equality
// ── Tier 11 ───────────────  &                    bitwise AND
// ── Tier 12 ───────────────  ^                    bitwise XOR
// ── Tier 13 ───────────────  |                    bitwise OR
// ── Tier 14 ───────────────  &&                   logical AND
// ── Tier 15 ───────────────  ||                   logical OR
// ── Tier 16 ───────────────  ?:  =  +=  -=  etc   ternary / assign
// ── Tier 17 (loosest) ─────  ,                    comma

// When in doubt — use parentheses. They're free.
bool ok = (x & mask) != 0;   // without (): & has lower prec than !=!`;

// ── Page component ──────────────────────────────────────────────────────────

export default function OperatorsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Operator Precedence */}
        <Card title="Operator Precedence" num="01" color="yellow" size="lg">
          <Prose>
            <H3>Precedence & associativity</H3>
            <P>
              Precedence determines which operator grabs its operands first. Associativity breaks
              ties between operators of the same precedence — nearly all are left-to-right except
              assignment, ternary, and unary operators which are right-to-left.
            </P>
            <Grid>
              <Cell>
                <H3>Common surprises</H3>
                <OL>
                  <LI><Code>&</Code> (bitwise AND) has lower precedence than <Code>==</Code> — always write <Code>(x & mask) != 0</Code></LI>
                  <LI><Code>||</Code> has lower precedence than <Code>&amp;&amp;</Code> — <Code>a || b &amp;&amp; c</Code> means <Code>a || (b &amp;&amp; c)</Code></LI>
                  <LI>Shift operators <Code>&lt;&lt;</Code> <Code>&gt;&gt;</Code> are lower than <Code>+</Code> and <Code>-</Code></LI>
                  <LI>Ternary <Code>?:</Code> is right-associative and very low precedence — parenthesize when mixing with assignment</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Associativity</H3>
                <OL>
                  <LI>Left-to-right: <Code>a - b - c</Code> → <Code>(a - b) - c</Code></LI>
                  <LI>Right-to-left: <Code>a = b = c</Code> → <Code>a = (b = c)</Code></LI>
                  <LI>Right-to-left: <Code>++*ptr</Code> → <Code>++(*ptr)</Code> (deref first)</LI>
                  <LI>Unary prefix operators are right-to-left; postfix are left-to-right</LI>
                </OL>
                <Note>When in doubt, parenthesize. The compiler won&apos;t mind and your reader will thank you.</Note>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_precedence} />
        </Card>

        {/* 02 Arithmetic */}
        <Card title="Arithmetic Pitfalls" num="02" color="yellow" size="md">
          <CodeBlock code={c_arithmetic} />
          <InfoTable rows={[
            { key: "5 / 2 == 2",       value: "Integer division truncates toward zero. Cast one operand to double for real division." },
            { key: "-7 % 2 == -1",      value: "Modulo sign matches the dividend (C++11). Be careful in hash/wrap calculations." },
            { key: "signed overflow",   value: "Undefined behavior — the compiler may assume it never happens and optimize accordingly." },
            { key: "unsigned wrap",     value: "Wraps modulo 2ⁿ — well-defined. Use unsigned when wrapping behavior is intentional." },
            { key: "i++ vs ++i",        value: "Post-increment copies the old value. Prefer pre-increment — same result for scalars, faster for iterators." },
          ]} />
        </Card>

        {/* 03 Bitwise */}
        <Card title="Bitwise Operators" num="03" color="yellow" size="md">
          <CodeBlock code={c_bitwise} />
          <InfoTable rows={[
            { key: "& (AND)",   value: "Both bits must be 1. Use to test or clear specific bits." },
            { key: "| (OR)",    value: "Either bit must be 1. Use to set specific bits." },
            { key: "^ (XOR)",   value: "Bits must differ. Use to toggle bits or swap without a temp." },
            { key: "~ (NOT)",   value: "Flips all bits. Result is signed-type dependent — prefer unsigned operands." },
            { key: "<< / >>",   value: "Shift left/right by n positions. Left shift by n = multiply by 2ⁿ (if no overflow)." },
          ]} />
          <Tip color="yellow">
            <strong>Always use unsigned types for bitwise ops.</strong> Right-shifting a negative signed integer is implementation-defined behavior. Use <code>uint32_t</code> or <code>unsigned int</code> for bitmasks.
          </Tip>
        </Card>

        {/* 04 Comparison & Logical */}
        <Card title="Comparison · Logical · Spaceship" num="04" color="yellow" size="md">
          <CodeBlock code={c_comparison} />
          <InfoTable rows={[
            { key: "signed/unsigned cmp", value: "Comparing int and unsigned int: the signed value silently converts to unsigned. -1 < 1u is false." },
            { key: "short-circuit &&",    value: "Right operand not evaluated if left is false. Safe for null checks: ptr && ptr->val." },
            { key: "short-circuit ||",    value: "Right operand not evaluated if left is true. Use for cheap fallback checks." },
            { key: "<=> (C++20)",          value: "Returns a comparison category object. Default it in your class to get all 6 comparison operators free." },
          ]} />
        </Card>

        {/* 05 Other Operators */}
        <Card title="sizeof · alignof · Ternary · typeid" num="05" color="yellow" size="md">
          <CodeBlock code={c_other} />
          <InfoTable rows={[
            { key: "sizeof(arr)",        value: "Returns total byte size of the array — only works for actual arrays, not pointers. Use std::size() in C++17." },
            { key: "alignof(T)",         value: "Returns the alignment requirement of T. Useful when allocating aligned memory manually." },
            { key: "condition ? a : b",  value: "Ternary — both branches must be the same type (or implicitly convertible). Returns a value." },
            { key: "typeid(x).name()",   value: "Runtime type name — implementation-defined string. Use for debugging only, not production logic." },
          ]} />
        </Card>

        {/* 06 Operator Overloading */}
        <Card title="Operator Overloading" num="06" color="yellow" size="md">
          <CodeBlock code={c_overload} />
          <InfoTable rows={[
            { key: "member op",       value: "Left operand is *this. Use for operators that modify the object (+=, -=, [], ())." },
            { key: "free function",   value: "Neither operand is *this. Required when left operand is not your type (e.g., ostream <<)." },
            { key: "return *this",    value: "Compound assignment ops (+=, etc.) must return *this by reference to allow chaining." },
            { key: "= default (<=>)", value: "C++20: defaulting operator<=> auto-generates all 6 comparison operators with member-wise semantics." },
          ]} />
          <Tip color="yellow">
            <strong>Don&apos;t overload for cleverness.</strong> Only overload when the operator has an obvious, unsurprising meaning for your type. Overloading <code>+</code> for string concatenation: fine. Overloading <code>&amp;&amp;</code> or <code>||</code>: breaks short-circuit evaluation.
          </Tip>
        </Card>

      </div>
    </>
  );
}

import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_basic = `\
#include <cmath>

// ── Powers & roots ────────────────────────────────────────────
std::sqrt(16.0)      // 4.0    — square root
std::cbrt(27.0)      // 3.0    — cube root
std::pow(2.0, 10.0)  // 1024.0 — x^y (floating-point)
std::hypot(3.0, 4.0) // 5.0    — sqrt(x²+y²), avoids overflow

// ── Rounding ──────────────────────────────────────────────────
std::floor(3.7)      //  3.0   — round toward -∞
std::ceil(3.2)       //  4.0   — round toward +∞
std::round(3.5)      //  4.0   — round half away from zero
std::trunc(3.9)      //  3.0   — round toward zero
std::round(-3.5)     // -4.0   — away from zero

// ── Absolute value ────────────────────────────────────────────
std::abs(-5)         // 5     — <cstdlib> for int
std::abs(-5.0)       // 5.0   — <cmath> for double
std::fabs(-5.0)      // 5.0   — explicit floating-point abs

// ── Remainder ─────────────────────────────────────────────────
std::fmod(10.5, 3.0)   // 1.5  — floating-point remainder (sign = dividend)
std::remainder(10.5, 3.0) // -0.5 — IEEE remainder (closest integer)`;

const c_trig = `\
#include <cmath>

// ── Trigonometry (arguments in radians) ──────────────────────
std::sin(M_PI / 6)   // 0.5   — sine
std::cos(M_PI / 3)   // 0.5   — cosine
std::tan(M_PI / 4)   // 1.0   — tangent

// ── Inverse trig ──────────────────────────────────────────────
std::asin(0.5)        // π/6  — arcsine,   result in [-π/2, π/2]
std::acos(0.5)        // π/3  — arccosine, result in [0, π]
std::atan(1.0)        // π/4  — arctangent, result in (-π/2, π/2)
std::atan2(y, x)      // angle of (x,y) from origin in [-π, π]
                      // ← preferred over atan(y/x) — handles all quadrants

// ── Hyperbolic ────────────────────────────────────────────────
std::sinh(x)   std::cosh(x)   std::tanh(x)

// ── Degrees ↔ Radians ─────────────────────────────────────────
constexpr double PI = std::numbers::pi;  // C++20 <numbers>
double toRad(double deg) { return deg * PI / 180.0; }
double toDeg(double rad) { return rad * 180.0 / PI; }`;

const c_log = `\
#include <cmath>

// ── Exponential & logarithm ───────────────────────────────────
std::exp(1.0)        // 2.718... — e^x
std::exp2(8.0)       // 256.0   — 2^x
std::expm1(x)        // e^x - 1 — accurate for small x

std::log(std::numbers::e) // 1.0    — natural log (base e)
std::log2(1024.0)         // 10.0   — log base 2
std::log10(1000.0)        // 3.0    — log base 10
std::log1p(x)             // log(1+x) — accurate for small x

// ── Special float values ──────────────────────────────────────
#include <limits>
double inf = std::numeric_limits<double>::infinity();
double nan = std::numeric_limits<double>::quiet_NaN();
double eps = std::numeric_limits<double>::epsilon(); // ~2.22e-16

std::isinf(x)    std::isnan(x)    std::isfinite(x)

// ── Safe float comparison ─────────────────────────────────────
bool nearlyEqual(double a, double b, double tol = 1e-9) {
  return std::abs(a - b) <= tol * std::max(std::abs(a), std::abs(b));
}`;

const c_random = `\
#include <random>

// ── Correct random number generation ─────────────────────────
std::mt19937 rng(std::random_device{}());  // seeded Mersenne Twister

// Uniform integer in [1, 6]
std::uniform_int_distribution<int> dice(1, 6);
int roll = dice(rng);

// Uniform float in [0.0, 1.0)
std::uniform_real_distribution<double> unit(0.0, 1.0);
double r = unit(rng);

// Normal (Gaussian) distribution — mean=0, stddev=1
std::normal_distribution<double> normal(0.0, 1.0);
double sample = normal(rng);

// ── Other distributions ───────────────────────────────────────
std::bernoulli_distribution  coin(0.5);       // true/false with prob p
std::poisson_distribution<int> poisson(4.0);  // events per interval
std::exponential_distribution<double> exp(1.5);

// ── Shuffle a vector ──────────────────────────────────────────
std::shuffle(v.begin(), v.end(), rng);

// ⚠ Never use: rand() % n — not uniform, implementation-defined seed
// std::random_device{}() may be slow — seed once, reuse rng`;

const c_numeric_limits = `\
#include <limits>
#include <numbers>  // C++20

// ── Integer limits ────────────────────────────────────────────
std::numeric_limits<int>::min()      // -2147483648
std::numeric_limits<int>::max()      //  2147483647
std::numeric_limits<unsigned>::max() //  4294967295
std::numeric_limits<long long>::max()// 9223372036854775807

// ── Float limits ──────────────────────────────────────────────
std::numeric_limits<double>::max()      // ~1.8e308
std::numeric_limits<double>::min()      // ~2.2e-308 (smallest positive normal)
std::numeric_limits<double>::lowest()   // ~-1.8e308 (most negative)
std::numeric_limits<double>::epsilon()  // ~2.2e-16 (machine epsilon)
std::numeric_limits<double>::digits10   // 15 (significant decimal digits)

// ── C++20 mathematical constants (<numbers>) ──────────────────
std::numbers::pi        // 3.14159265358979...
std::numbers::e         // 2.71828182845904...
std::numbers::sqrt2     // 1.41421356237309...
std::numbers::ln2       // 0.693147180559945...
std::numbers::phi       // 1.61803398874989... (golden ratio)

// Available as templates: std::numbers::pi_v<float>, etc.`;

// ── Page component ──────────────────────────────────────────────────────────

export default function MathPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Math in C++" num="01" color="yellow" size="lg">
          <Prose>
            <H3>Headers and precision</H3>
            <P>
              C++ math lives in <Code>&lt;cmath&gt;</Code> (functions), <Code>&lt;limits&gt;</Code>
              (type bounds), <Code>&lt;random&gt;</Code> (RNG), and <Code>&lt;numbers&gt;</Code>
              (C++20 constants). All <Code>&lt;cmath&gt;</Code> functions operate on <Code>double</Code>
              by default — pass <Code>float</Code> arguments and you get a promotion that may surprise you.
            </P>
            <Grid>
              <Cell>
                <H3>Common pitfalls</H3>
                <OL>
                  <LI>Never compare floats with <Code>==</Code> — use an epsilon tolerance.</LI>
                  <LI><Code>pow(2, 10)</Code> is integer literals → double → may lose precision. Use <Code>1 &lt;&lt; 10</Code> for integer powers of 2.</LI>
                  <LI><Code>std::abs(-5)</Code> requires <Code>&lt;cstdlib&gt;</Code> for int; <Code>&lt;cmath&gt;</Code> for double — wrong header gives wrong overload.</LI>
                  <LI><Code>rand()</Code> is not uniformly distributed — always use <Code>&lt;random&gt;</Code>.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Performance tips</H3>
                <OL>
                  <LI>Use <Code>float</Code> instead of <Code>double</Code> where precision allows — SIMD can process 2× as many floats per cycle.</LI>
                  <LI><Code>std::hypot</Code> avoids overflow on large inputs — don&apos;t write <Code>sqrt(x*x + y*y)</Code>.</LI>
                  <LI><Code>log1p(x)</Code> and <Code>expm1(x)</Code> are more accurate than <Code>log(1+x)</Code> and <Code>exp(x)-1</Code> for small <Code>x</Code>.</LI>
                  <LI>For integer exponentiation, use repeated squaring — not <Code>pow</Code>.</LI>
                </OL>
                <Note>Compile with -ffast-math for ~2–4× floating-point speedup — but it breaks NaN handling and strict IEEE 754 compliance.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Basic Functions */}
        <Card title="Powers · Roots · Rounding · abs" num="02" color="yellow" size="md">
          <CodeBlock code={c_basic} />
          <InfoTable rows={[
            { key: "hypot(x, y)",    value: "sqrt(x²+y²) without overflow. Use for distances and vector magnitudes." },
            { key: "pow(x, y)",      value: "Floating-point exponentiation. For integer powers, use repeated multiplication — it's exact and faster." },
            { key: "round vs trunc", value: "round: half away from zero. trunc: toward zero. floor: toward -∞. ceil: toward +∞." },
            { key: "fmod vs %",      value: "% only works on integers. fmod is the float equivalent. Sign matches the dividend." },
          ]} />
        </Card>

        {/* 03 Trig */}
        <Card title="Trigonometry" num="03" color="yellow" size="md">
          <CodeBlock code={c_trig} />
          <InfoTable rows={[
            { key: "radians",       value: "All trig functions use radians. Multiply degrees by π/180 to convert." },
            { key: "atan2(y, x)",   value: "Preferred over atan(y/x) — correctly handles all four quadrants and x=0." },
            { key: "M_PI",          value: "POSIX extension, not standard C++. Use std::numbers::pi (C++20) or define your own constexpr." },
            { key: "std::numbers",  value: "C++20 header providing pi, e, sqrt2, ln2, phi as compile-time constants." },
          ]} />
        </Card>

        {/* 04 Log & Special Values */}
        <Card title="Logarithms · Exp · Special Values" num="04" color="yellow" size="md">
          <CodeBlock code={c_log} />
          <InfoTable rows={[
            { key: "log1p / expm1",  value: "Numerically stable versions of log(1+x) and exp(x)-1 for small x. Use in probability and financial math." },
            { key: "epsilon()",      value: "Smallest value e such that 1.0 + e != 1.0. The basis for epsilon comparisons." },
            { key: "lowest()",       value: "Most negative representable value — different from min() which is the smallest positive normal." },
            { key: "quiet_NaN()",    value: "Not-a-Number. NaN != NaN is always true — use std::isnan() to check." },
          ]} />
        </Card>

        {/* 05 Random */}
        <Card title="Random Number Generation" num="05" color="yellow" size="md">
          <CodeBlock code={c_random} />
          <InfoTable rows={[
            { key: "mt19937",                   value: "Mersenne Twister — fast, high quality, 623-dimensional equidistribution. The standard choice." },
            { key: "random_device",             value: "Hardware entropy source for seeding. Slow — call once to seed mt19937, not for every number." },
            { key: "uniform_int_distribution",  value: "Guaranteed uniform distribution on [a, b]. Use instead of rng() % n." },
            { key: "normal_distribution",       value: "Gaussian bell curve. Specify mean and standard deviation." },
          ]} />
          <Tip color="yellow">
            <strong>Never use <code>rand()</code>.</strong> It has poor statistical properties, a tiny period, and non-uniform distribution when used with <code>%</code>. Use <code>std::mt19937</code> + a distribution.
          </Tip>
        </Card>

        {/* 06 Limits & Constants */}
        <Card title="Numeric Limits & C++20 Constants" num="06" color="yellow" size="md">
          <CodeBlock code={c_numeric_limits} />
          <InfoTable rows={[
            { key: "numeric_limits<T>::max()",    value: "Largest finite value of type T. Use instead of INT_MAX or DBL_MAX macros." },
            { key: "numeric_limits<T>::lowest()", value: "Most negative value. For floats this differs from min() — always use lowest() for the floor." },
            { key: "std::numbers::pi",            value: "C++20: compile-time double precision π. Prefer over M_PI (POSIX) or hand-coded literals." },
            { key: "epsilon()",                   value: "Machine epsilon — the gap between 1.0 and the next representable double. Use as relative tolerance base." },
          ]} />
        </Card>

      </div>
    </>
  );
}

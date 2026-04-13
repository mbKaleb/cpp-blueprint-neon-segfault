import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_passing = `\
// ── Pass by value — caller's copy is unchanged ───────────────
void doubleIt(int n) { n *= 2; }   // modifies local copy only
int x = 5; doubleIt(x);            // x is still 5

// ── Pass by reference — modifies the original ────────────────
void doubleIt(int& n) { n *= 2; }
doubleIt(x);                        // x is now 10

// ── Pass by const reference — read-only, no copy ─────────────
void print(const std::string& s) { std::cout << s; }
// ✅ No copy of the string — fast even for large objects

// ── Pass by pointer — optional / nullable reference ──────────
void maybeDouble(int* p) {
  if (p) *p *= 2;   // caller passes nullptr to skip
}
maybeDouble(&x);    // ✅
maybeDouble(nullptr); // ✅ safe — null check inside

// ── Rule of thumb ────────────────────────────────────────────
// Small/cheap types (int, double, char): pass by value
// Large objects, read-only:              pass by const&
// Must modify caller's variable:         pass by &
// Optional / nullable:                   pass by pointer`;

const c_overload = `\
// Overloading — same name, different parameter types/count
int    area(int side)              { return side * side; }
double area(double side)           { return side * side; }
int    area(int w, int h)          { return w * h; }

area(5);       // calls area(int)
area(3.0);     // calls area(double)
area(4, 6);    // calls area(int, int)

// ── Resolution rules (simplified) ───────────────────────────
// 1. Exact match             → preferred
// 2. Trivial conversions     → const, array→pointer
// 3. Promotions              → char→int, float→double
// 4. Standard conversions    → int→double, derived→base
// 5. User-defined conversions
// 6. Variadic (...)

// ── Overloading pitfalls ─────────────────────────────────────
void foo(int);
void foo(double);
foo(3.14f);   // ⚠ ambiguous: float → int or float → double?

// ── Cannot overload on return type alone ─────────────────────
// int  get();    ❌ same name + same params = redefinition
// bool get();`;

const c_default = `\
// Default arguments — must be rightmost parameters
void connect(std::string host, int port = 80, bool ssl = false);

connect("example.com");           // port=80, ssl=false
connect("example.com", 443);      // ssl=false
connect("example.com", 443, true);

// ── Rules ────────────────────────────────────────────────────
// Defaults are set in the declaration (usually the header)
// Once a parameter has a default, all to its right must also
// Defaults can reference earlier parameters? No — not allowed
// void bad(int a, int b = a) {}  // ❌ not allowed

// ── Default vs overload ──────────────────────────────────────
// Defaults are syntactic sugar — caller still passes the value
// Overloads can have completely different implementations
// Use defaults when the logic is identical; overloads otherwise

// ── Template default arguments ───────────────────────────────
template<typename T = double>
T zero() { return T{}; }
zero();       // returns 0.0 (double)
zero<int>();  // returns 0`;

const c_lambda = `\
// Lambda syntax: [capture](params) -> return_type { body }
auto square = [](int x) { return x * x; };
square(5);   // 25

// ── Captures ─────────────────────────────────────────────────
int factor = 3;
auto mul = [factor](int x) { return x * factor; };  // copy
auto inc = [&factor](int x) { factor++; return x; }; // ref

// [=]  capture all locals by copy
// [&]  capture all locals by reference
// [=, &x]  all by copy except x by ref
// [this]   capture the current object (member access)

// ── Common uses ───────────────────────────────────────────────
std::vector<int> v = {3, 1, 4, 1, 5};
std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });

std::for_each(v.begin(), v.end(), [](int x){ std::cout << x; });

// ── Mutable lambda (modify captured copies) ──────────────────
auto counter = [n = 0]() mutable { return ++n; };
counter();  // 1
counter();  // 2

// ── Generic lambda (C++14) ───────────────────────────────────
auto println = [](const auto& x) { std::cout << x << "\\n"; };
println(42); println("hi"); println(3.14);`;

const c_fnptr = `\
// ── Function pointer ─────────────────────────────────────────
int add(int a, int b) { return a + b; }

int (*op)(int, int) = add;   // declare + assign
op(3, 4);                     // 7

// Using typedef / using for readability
using BinOp = int(*)(int, int);
BinOp fn = add;

// Array of function pointers (dispatch table)
BinOp ops[] = { add, subtract, multiply };
ops[0](3, 4);   // calls add

// ── std::function — type-erased callable ─────────────────────
#include <functional>
std::function<int(int,int)> f = add;       // function pointer
f = [](int a, int b){ return a + b; };    // lambda
f = std::bind(add, std::placeholders::_1, 10); // partial apply

// ── When to use which ────────────────────────────────────────
// function pointer — zero overhead, only free functions/static methods
// std::function   — flexible, accepts anything callable, ~small heap alloc
// template param  — fastest (inlined), but increases compile time + code size
template<typename F>
void apply(F fn, int x) { fn(x); }`;

const c_rvo = `\
// Return Value Optimization — compiler eliminates the copy

std::vector<int> makeVec() {
  std::vector<int> v = {1, 2, 3, 4, 5};
  return v;   // RVO: constructed directly in caller's storage
}

auto data = makeVec();   // no copy, no move — zero cost return

// ── Named RVO (NRVO) ─────────────────────────────────────────
std::string buildMsg(bool err) {
  std::string msg;          // named local variable
  if (err) msg = "error";
  else     msg = "ok";
  return msg;               // NRVO applies when one path returns same var
}

// ── Guaranteed copy elision (C++17) ──────────────────────────
// Returning a prvalue (temporary) is GUARANTEED to elide the copy
// The object is constructed directly at the call site
Widget makeWidget() { return Widget{args}; }  // zero copies, guaranteed

// ── Practical rule ───────────────────────────────────────────
// Return objects by value — trust RVO/NRVO
// Don't return local variables by reference — dangling reference!
// int& bad() { int x = 5; return x; }  // ❌ UB — x destroyed on return`;

// ── Page component ──────────────────────────────────────────────────────────

export default function FunctionsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Functions in C++" num="01" color="green" size="lg">
          <Prose>
            <H3>Declaration vs Definition</H3>
            <P>
              A <Code>declaration</Code> tells the compiler a function exists and what its signature
              is. A <Code>definition</Code> provides the body. You can declare many times but define
              exactly once (ODR). Declarations live in headers; definitions in <Code>.cpp</Code> files.
            </P>
            <Grid>
              <Cell>
                <H3>Parameter passing summary</H3>
                <OL>
                  <LI><Code>T</Code> — by value. Caller&apos;s copy unchanged. Use for small cheap types.</LI>
                  <LI><Code>const T&amp;</Code> — by const ref. No copy, read-only. Use for large objects.</LI>
                  <LI><Code>T&amp;</Code> — by ref. Modifies caller&apos;s variable directly.</LI>
                  <LI><Code>T*</Code> — by pointer. Optional/nullable. Must null-check inside.</LI>
                  <LI><Code>T&amp;&amp;</Code> — rvalue ref (move semantics). Transfers ownership of temporaries.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Key rules</H3>
                <OL>
                  <LI>Never return a reference or pointer to a local variable — it is destroyed when the function returns.</LI>
                  <LI>Return objects by value — the compiler applies RVO/NRVO to eliminate copies.</LI>
                  <LI>Prefer <Code>const&amp;</Code> over pointer for non-optional in-parameters.</LI>
                  <LI>Mark functions that don&apos;t modify the object <Code>const</Code> (member functions).</LI>
                </OL>
                <Note>C++17 guarantees copy elision for prvalue returns — returning a temporary is always zero-cost.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Parameter Passing */}
        <Card title="Parameter Passing" num="02" color="green" size="md">
          <CodeBlock code={c_passing} />
          <InfoTable rows={[
            { key: "by value",       value: "Independent copy — changes inside the function don't affect the caller. Best for int, double, char, small structs." },
            { key: "by const&",      value: "Read-only alias — no copy. Best for std::string, vectors, any large object you won't modify." },
            { key: "by &",           value: "Mutable alias — directly modifies the caller's variable. Use when the function's purpose is to change the argument." },
            { key: "by pointer",     value: "Like reference but nullable. Use when passing nullptr is a meaningful option." },
          ]} />
        </Card>

        {/* 03 Overloading */}
        <Card title="Function Overloading" num="03" color="green" size="md">
          <CodeBlock code={c_overload} />
          <InfoTable rows={[
            { key: "exact match",      value: "The compiler prefers the overload whose parameter types exactly match the argument types." },
            { key: "promotions",       value: "char and short promote to int; float promotes to double — may select an unexpected overload." },
            { key: "ambiguous call",   value: "When two overloads are equally good, the compiler errors. Resolve with an explicit cast." },
            { key: "return type",      value: "Return type is NOT part of the overload signature — you cannot overload on return type alone." },
          ]} />
        </Card>

        {/* 04 Default Arguments */}
        <Card title="Default Arguments & Templates" num="04" color="green">
          <CodeBlock code={c_default} />
          <Tip color="green">
            <strong>Defaults go in the declaration, not the definition.</strong> If you split declaration (header) and definition (.cpp), put the default values only in the header — the compiler reads the declaration at the call site.
          </Tip>
        </Card>

        {/* 05 Lambdas */}
        <Card title="Lambda Expressions (C++11/14)" num="05" color="green" size="md">
          <CodeBlock code={c_lambda} />
          <InfoTable rows={[
            { key: "[=]",          value: "Capture all locals by copy. Safe but may copy large objects — be specific when it matters." },
            { key: "[&]",          value: "Capture all by reference. Fast, but the lambda must not outlive the captured variables." },
            { key: "mutable",      value: "Allows modifying captured-by-copy values inside the lambda body." },
            { key: "auto params",  value: "Generic lambda (C++14) — auto parameters make it a template, callable with any type." },
          ]} />
          <Tip color="green">
            <strong>Prefer specific captures over [=] or [&amp;].</strong> Naming what you capture makes dependencies explicit and prevents accidentally capturing <code>this</code> or large objects.
          </Tip>
        </Card>

        {/* 06 Function Pointers & std::function */}
        <Card title="Function Pointers & std::function" num="06" color="green" size="md">
          <SectionLabel>Storing and passing callables</SectionLabel>
          <CodeBlock code={c_fnptr} />
          <InfoTable rows={[
            { key: "function pointer",  value: "Zero overhead. Only works with free functions and static methods. Syntax is awkward." },
            { key: "std::function",     value: "Accepts any callable (pointer, lambda, functor). Small overhead from type erasure. Prefer for APIs." },
            { key: "template param",    value: "Fastest — inlined by compiler. Use when callable type is known at compile time (e.g. sort comparator)." },
          ]} />
        </Card>

        {/* 07 RVO */}
        <Card title="Return Value Optimization (RVO)" num="07" color="green" size="md">
          <CodeBlock code={c_rvo} />
          <InfoTable rows={[
            { key: "RVO",        value: "Unnamed return value optimization — compiler constructs the return value directly in the caller's storage." },
            { key: "NRVO",       value: "Named RVO — applies when a single named local variable is returned. Not guaranteed but done by all major compilers." },
            { key: "C++17 elision", value: "Returning a prvalue (temporary) is guaranteed to elide the copy — no move constructor required." },
            { key: "don't std::move return", value: "Writing return std::move(x) disables NRVO — let the compiler do it." },
          ]} />
          <Tip color="green">
            <strong>Return by value freely.</strong> With RVO, NRVO, and C++17 guaranteed elision, returning even large objects by value is typically free. Never return a local by reference.
          </Tip>
        </Card>

      </div>
    </>
  );
}

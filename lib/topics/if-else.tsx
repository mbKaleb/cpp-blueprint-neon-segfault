import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_basics = `\
// ── Standard if / else if / else ────────────────────────────
if (x > 0) {
  std::cout << "positive\\n";
} else if (x == 0) {
  std::cout << "zero\\n";
} else {
  std::cout << "negative\\n";
}

// ── Common pitfalls ──────────────────────────────────────────
if (x = 5)   // ❌ assignment, not comparison — always true!
if (x == 5)  // ✅ comparison

// Dangling else — the else binds to the nearest if
if (a)
  if (b)
    doB();
  else       // ← this else belongs to "if (b)", NOT "if (a)"
    doElse();

// Fix: always use braces
if (a) {
  if (b) doB();
} else {
  doElse();
}`;

const c_init = `\
// if with initializer (C++17)
// Syntax: if (init-statement; condition)
// The initialized variable lives only for the if/else block

// File open check
if (std::ifstream file{"data.txt"}; file) {
  std::string line;
  std::getline(file, line);
  // file is in scope here
} // file closed and destroyed here

// Map lookup
if (auto it = map.find(key); it != map.end()) {
  use(it->second);
} // it destroyed here — no namespace pollution

// Mutex lock
if (std::lock_guard lock{mutex}; condition) {
  // critical section
}

// vs. the old way (variable leaks into outer scope):
auto it = map.find(key);   // still visible after the if
if (it != map.end()) { use(it->second); }`;

const c_constexpr_if = `\
#include <type_traits>

// if constexpr (C++17) — compile-time branch selection
// The discarded branch is parsed but NOT instantiated
// → no type errors in the dead branch

template<typename T>
void process(T val) {
  if constexpr (std::is_integral_v<T>) {
    std::cout << "int: " << val << "\\n";
  } else if constexpr (std::is_floating_point_v<T>) {
    std::cout << "float: " << std::fixed << val << "\\n";
  } else if constexpr (std::is_same_v<T, std::string>) {
    std::cout << "str[" << val.size() << "]: " << val << "\\n";
  } else {
    static_assert(false, "unsupported type");
  }
}

// Key difference from regular if:
// Regular if — both branches compiled for every T (fails if T
//              doesn't support .size() when T=int)
// if constexpr — only matching branch compiled for each T`;

const c_shortcircuit = `\
// && short-circuits: stops at first false
// || short-circuits: stops at first true

// Safe null-pointer check
if (ptr != nullptr && ptr->value > 0) { }
//  ^^^^^^^^^^^^^^^^ if false, ptr->value never touched

// Safe array access
if (i < vec.size() && vec[i] == target) { }

// Lazy evaluation — expensive() only runs when needed
if (cheapCheck() || expensive()) { }

// Short-circuit with side effects — be careful
int x = 0;
if (true || ++x) { }   // x is still 0 — ++x never ran

// Use this pattern for optional initialization:
Node* node = (head != nullptr) ? head->next : nullptr;

// ── Truthiness rules ─────────────────────────────────────────
// False: 0, 0.0, nullptr, false, empty (NOT automatic for objects)
// True:  anything else
// std::string, std::vector etc. do NOT convert to bool implicitly
// Use: if (!str.empty()) not if (str)`;

const c_ternary = `\
// condition ? value_if_true : value_if_false
int abs_x = (x >= 0) ? x : -x;

// Both branches must be the same type (or implicitly convertible)
auto val = flag ? 1 : 2.0;    // int promoted to double → double

// Nested ternary (chain, right-associative) — use sparingly
std::string grade =
  score >= 90 ? "A" :
  score >= 80 ? "B" :
  score >= 70 ? "C" : "F";

// Ternary in initializer (avoids if/else for const init)
const std::string msg = (err == 0) ? "ok" : "fail";
// Without ternary, msg can't be const (can't assign in if/else after decl)

// ⚠ Ternary cannot contain statements — only expressions
// (x > 0) ? doA() : doB();   // ok if doA/doB return values
// (x > 0) ? { doA(); } : doB();  // ❌ braces not allowed`;

const c_optional = `\
#include <optional>

// std::optional<T> — a value that may or may not exist
// Better than returning -1 or nullptr as a sentinel

std::optional<int> divide(int a, int b) {
  if (b == 0) return std::nullopt;  // no value
  return a / b;
}

// Using the result
if (auto result = divide(10, 2); result) {
  std::cout << *result << "\\n";    // dereference to get value
}

// Other access patterns
auto r = divide(10, 0);
r.has_value();      // false
r.value_or(-1);     // -1 — safe fallback, no exception
*r;                 // ❌ undefined behavior if empty — use has_value first

// optional as early-return guard (replaces nested ifs)
std::optional<Config> cfg = loadConfig();
if (!cfg) { return; }   // bail early
use(cfg->setting);       // -> works on optional directly`;

// ── Page component ──────────────────────────────────────────────────────────

export default function IfElsePage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="if / else Fundamentals" num="01" color="cyan" size="lg">
          <Prose>
            <H3>Branching in C++</H3>
            <P>
              <Code>if</Code> evaluates a condition and executes one of two branches. C++ considers
              any non-zero scalar value as <Code>true</Code> — integers, pointers, and floats all
              work as conditions, though only <Code>bool</Code> expresses intent clearly.
            </P>
            <Grid>
              <Cell>
                <H3>Rules</H3>
                <OL>
                  <LI>Always use braces <Code>{"{}"}</Code> — even for single-statement bodies. Prevents dangling-else and accidental scope bugs.</LI>
                  <LI><Code>=</Code> inside a condition is assignment, not comparison. Enable <Code>-Wall</Code> to catch this.</LI>
                  <LI>The <Code>else</Code> always binds to the nearest unmatched <Code>if</Code> — braces make this unambiguous.</LI>
                  <LI>Conditions are evaluated left-to-right with short-circuit semantics.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>What counts as true / false</H3>
                <OL>
                  <LI><Code>false</Code>: <Code>0</Code>, <Code>0.0</Code>, <Code>nullptr</Code>, <Code>false</Code></LI>
                  <LI><Code>true</Code>: any non-zero integer, non-null pointer, <Code>true</Code></LI>
                  <LI>Standard containers (<Code>vector</Code>, <Code>string</Code>) do NOT implicitly convert to <Code>bool</Code> — use <Code>.empty()</Code></LI>
                  <LI><Code>std::optional</Code> does convert to <Code>bool</Code> — <Code>true</Code> if it holds a value</LI>
                </OL>
                <Note>Prefer explicit comparisons (<Code>x != 0</Code>) over implicit truthiness for non-bool types — it signals intent clearly.</Note>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_basics} />
        </Card>

        {/* 02 if with initializer */}
        <Card title="if with Initializer (C++17)" num="02" color="cyan" size="md">
          <CodeBlock code={c_init} />
          <InfoTable rows={[
            { key: "if (init; cond)",   value: "Init runs once before the condition. Variable is scoped to the entire if/else block — not the surrounding scope." },
            { key: "map.find()",        value: "Classic use case: scope the iterator to the lookup — avoids a dangling variable after the block." },
            { key: "lock_guard",        value: "Scoped lock held only for the duration of the if/else body." },
          ]} />
          <Tip color="cyan">
            <strong>Reduces namespace pollution.</strong> Without the initializer form, helper variables like iterators and file handles leak into the surrounding scope even though they&apos;re only relevant to the branch.
          </Tip>
        </Card>

        {/* 03 if constexpr */}
        <Card title="if constexpr (C++17)" num="03" color="cyan" size="md">
          <CodeBlock code={c_constexpr_if} />
          <InfoTable rows={[
            { key: "compile-time",   value: "Condition must be a compile-time constant expression. Selected branch is instantiated; discarded branch is not." },
            { key: "vs regular if",  value: "Regular if compiles both branches for every template instantiation — fails if a branch uses a type-specific API." },
            { key: "static_assert",  value: "Safe to put in the else branch — only fires when that branch is actually instantiated." },
          ]} />
          <Tip color="cyan">
            <strong>Replaces most SFINAE and tag dispatch.</strong> <code>if constexpr</code> is the modern, readable way to write type-dependent logic inside a single function template.
          </Tip>
        </Card>

        {/* 04 Short-Circuit */}
        <Card title="Short-Circuit Evaluation" num="04" color="cyan" size="md">
          <CodeBlock code={c_shortcircuit} />
          <InfoTable rows={[
            { key: "ptr && ptr->x",    value: "Safe: right side only evaluated if ptr is non-null. The canonical null-guard pattern." },
            { key: "i < n && a[i]",    value: "Safe: bounds check before access. Order matters — flip them and you get UB." },
            { key: "cheap || costly",  value: "Put the fast check first. If it short-circuits, the slow check never runs." },
            { key: "side effects",     value: "Avoid side effects (++, function calls) in the right operand of && / || — they may silently not execute." },
          ]} />
        </Card>

        {/* 05 Ternary */}
        <Card title="Ternary Operator" num="05" color="cyan">
          <CodeBlock code={c_ternary} />
          <Tip color="cyan">
            <strong>Best for single-expression choices.</strong> Use ternary when initializing a <code>const</code> or choosing between two values inline. Prefer <code>if/else</code> for anything involving statements, side effects, or more than two branches.
          </Tip>
        </Card>

        {/* 06 std::optional */}
        <Card title="std::optional as a Branch Alternative" num="06" color="cyan" size="md">
          <CodeBlock code={c_optional} />
          <InfoTable rows={[
            { key: "std::nullopt",    value: "Represents the empty state. Assign to optional to indicate no value." },
            { key: "value_or(x)",     value: "Returns the value if present, otherwise x. Never throws. Preferred over dereferencing." },
            { key: "*opt / opt->m",   value: "Direct access — UB if empty. Only use after has_value() or inside an if (opt) check." },
            { key: "if (init; opt)",  value: "Combine with C++17 if-initializer to scope the optional and test it in one line." },
          ]} />
          <Tip color="cyan">
            <strong>Replace sentinel values.</strong> Returning <code>-1</code>, <code>nullptr</code>, or <code>INT_MAX</code> to signal failure is error-prone. <code>std::optional</code> makes the &quot;no result&quot; case explicit in the type system.
          </Tip>
        </Card>

      </div>
    </>
  );
}

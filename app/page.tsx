import Link from "next/link";
import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import SheetHeader from "@/components/sheet/SheetHeader";

// ── Code strings (plain C++) ───────────────────────────────────────────────

const c01 = `\
#include <iostream>   // input/output
#include <string>     // strings
#include <vector>     // dynamic arrays

using namespace std;   // optional convenience

int main() {
  // your code here
  cout << "Hello, World!\\n";
  return 0;   // 0 = success
}`;

const c03 = `\
// Declaration & initialization
int age = 25;
double pi = 3.14159;
string name = "Alice";
bool isReady = true;
auto score = 100;       // type = int

// Constants (cannot be changed)
const int MAX = 100;
constexpr double G = 9.81;`;

const c04 = `\
// Output
cout << "Hello";          // print
cout << "Hi" << endl;     // newline
cout << "Hi\\n";           // faster newline
cout << "x = " << x << "\\n";

// Input
int n;
cin >> n;                // read one value
cin >> a >> b;           // read two values

string line;
getline(cin, line);      // read whole line`;

const c05a = `\
a + b   a - b   a * b   a / b   a % b
a++   a--   ++a   --a
a += 5   a -= 2   a *= 3   a /= 2`;

const c05b = `\
==  !=  <  >  <=  >=          // comparison
&&  ||  !                       // AND  OR  NOT`;

const c06 = `\
if (x > 0) {
  cout << "positive\\n";
} else if (x == 0) {
  cout << "zero\\n";
} else {
  cout << "negative\\n";
}

// Ternary (shorthand if)
string res = (x > 0) ? "pos" : "neg";`;

const c07 = `\
switch (day) {
  case 1:
    cout << "Monday";
    break;
  case 2:
    cout << "Tuesday";
    break;
  default:
    cout << "Other";
}`;

const c08a = `\
for (int i = 0; i < 5; i++) {
  cout << i << " ";   // 0 1 2 3 4
}`;

const c08b = `\
int i = 0;
while (i < 5) { cout << i++; }`;

const c08c = `\
vector<int> v = {1, 2, 3};
for (int x : v) { cout << x; }
for (auto x : v) { cout << x; }`;

const c09 = `\
// Declaration (prototype)
int add(int a, int b);

// Definition
int add(int a, int b) {
  return a + b;
}

// Void (no return)
void greet(string name) {
  cout << "Hi " << name << "\\n";
}

// Default parameter
void greet(string name = "World") { }

// Call
int result = add(3, 4);   // result = 7`;

const c10a = `\
int arr[5] = {10, 20, 30, 40, 50};
arr[0];             // 10 (index from 0)
arr[2] = 99;        // modify element`;

const c10b = `\
int grid[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
grid[1][2];          // 6 (row 1, col 2)`;

const c11 = `\
#include <vector>

vector<int> v = {1, 2, 3};
v.push_back(4);      // add to end
v.pop_back();        // remove last
v.size();            // number of elements
v.empty();           // is it empty?
v.clear();           // remove all
v[0];                // access element
v.front();  v.back(); // first / last`;

const c12 = `\
#include <string>

string s = "Hello";
s.length();          // 5
s.size();            // same as length()
s[0];                // 'H'
s + " World";        // concatenate
s.substr(1, 3);      // "ell" (pos, len)
s.find("ll");        // index of "ll" → 2
s.replace(0, 1, "J"); // "Jello"
stoi("42");          // string → int
to_string(42);       // int → string`;

const c13a = `\
int x = 10;
int* ptr = &x;   // ptr holds address of x
*ptr;            // 10 (dereference)
*ptr = 20;       // changes x to 20`;

const c13b = `\
int& ref = x;   // ref IS x (no copy)
ref = 99;        // x is now 99

// Pass by reference (efficient)
void double_it(int& n) { n *= 2; }`;

const c14 = `\
struct Person {
  string name;
  int age;
};

Person p1 = {"Alice", 30};
Person p2;
p2.name = "Bob";
p2.age  = 25;

cout << p1.name;   // Alice`;

const c15 = `\
class Dog {
public:                          // accessible anywhere
  string name;
  int age;

  Dog(string n, int a) : name(n), age(a) {}   // constructor

  void bark() {
    cout << name << " says: Woof!\\n";
  }

private:                         // accessible only inside class
  int secret = 42;
};

Dog d("Rex", 3);     // create object
d.bark();            // Rex says: Woof!
cout << d.name;      // Rex`;

const c16 = `\
#include <algorithm>

vector<int> v = {3, 1, 4, 1, 5};

sort(v.begin(), v.end());    // ascending
// v = {1,1,3,4,5}

reverse(v.begin(), v.end());

min(3, 7);   max(3, 7);

auto it = find(v.begin(), v.end(), 4);
// it points to 4, or v.end() if not found`;

const c17 = `\
#include <cmath>

sqrt(16.0);    // 4.0
pow(2, 10);    // 1024.0
abs(-5);       // 5
floor(3.9);    // 3.0
ceil(3.1);     // 4.0
round(3.5);    // 4.0
log(2.718);    // ~1.0 (natural log)
log10(100);    // 2.0`;

const c19 = `\
# Compile
g++ main.cpp -o myprogram

# Compile with C++17 + warnings
g++ -std=c++17 -Wall main.cpp -o prog

# Run (Linux/Mac)
./myprogram

# Run (Windows)
myprogram.exe`;

const c20 = `\
// Allocate on heap
int* p = new int(42);
*p;             // 42
delete p;       // free memory!
p = nullptr;    // good practice

// Array on heap
int* arr = new int[5];
delete[] arr;   // use delete[]`;

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
<SheetHeader />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Program Structure */}
        <Card title="Program Structure" num="01" color="cyan">
          <CodeBlock code={c01} />
          <Tip color="cyan">
            <strong>Tip:</strong> Every C++ program needs a <code>main()</code> function — execution starts there.
          </Tip>
          <Link
            href="/topics/program-structure"
            className="mt-auto flex items-center justify-between px-3.5 py-2.5 font-mono text-[11px] tracking-[2px] uppercase text-accent hover:bg-white/[.04] transition-colors border-t border-border"
          >
            <span>Deep Dive — ODR · Linkage · C++17</span>
            <span>→</span>
          </Link>
        </Card>

        {/* 02 Data Types */}
        <Card title="Data Types" num="02" color="orange">
          <InfoTable rows={[
            { key: "int",       value: "Whole numbers · −2B to 2B" },
            { key: "long long", value: "Big integers · ±9.2×10¹⁸" },
            { key: "double",    value: "Decimal numbers (64-bit)" },
            { key: "float",     value: "Decimal numbers (32-bit)" },
            { key: "char",      value: "Single character · 'A'" },
            { key: "string",    value: 'Text · "hello"' },
            { key: "bool",      value: "true / false" },
            { key: "auto",      value: "Compiler infers the type" },
          ]} />
          <Link
            href="/topics/data-types"
            className="mt-auto flex items-center justify-between px-3.5 py-2.5 font-mono text-[11px] tracking-[2px] uppercase text-accent hover:bg-white/[.04] transition-colors border-t border-border"
          >
            <span>Deep Dive — Integers · Floats · Type Traits</span>
            <span>→</span>
          </Link>
        </Card>

        {/* 03 Variables & Constants */}
        <Card title="Variables & Constants" num="03" color="purple">
          <CodeBlock code={c03} />
        </Card>

        {/* 04 Input / Output */}
        <Card title="Input / Output" num="04" color="green">
          <CodeBlock code={c04} />
        </Card>

        {/* 05 Operators */}
        <Card title="Operators" num="05" color="yellow">
          <SectionLabel>Arithmetic</SectionLabel>
          <CodeBlock code={c05a} />
          <SectionLabel>Comparison &amp; Logical</SectionLabel>
          <CodeBlock code={c05b} />
        </Card>

        {/* 06 If / Else */}
        <Card title="If / Else" num="06" color="cyan">
          <CodeBlock code={c06} />
        </Card>

        {/* 07 Switch */}
        <Card title="Switch Statement" num="07" color="orange">
          <CodeBlock code={c07} />
          <Tip color="orange">
            <strong>Note:</strong> Always use <code>break</code> to prevent fall-through to the next case.
          </Tip>
        </Card>

        {/* 08 Loops */}
        <Card title="Loops" num="08" color="purple">
          <SectionLabel>For Loop</SectionLabel>
          <CodeBlock code={c08a} />
          <SectionLabel>While Loop</SectionLabel>
          <CodeBlock code={c08b} />
          <SectionLabel>Range-based For (C++11)</SectionLabel>
          <CodeBlock code={c08c} />
        </Card>

        {/* 09 Functions */}
        <Card title="Functions" num="09" color="green">
          <CodeBlock code={c09} />
        </Card>

        {/* 10 Arrays */}
        <Card title="Arrays" num="10" color="red">
          <SectionLabel>Static Array</SectionLabel>
          <CodeBlock code={c10a} />
          <SectionLabel>2D Array</SectionLabel>
          <CodeBlock code={c10b} />
          <Tip color="red">
            <strong>Warning:</strong> No bounds checking — accessing out-of-range is undefined behavior.
          </Tip>
        </Card>

        {/* 11 Vector */}
        <Card title="Vector (Dynamic Array)" num="11" color="cyan">
          <CodeBlock code={c11} />
        </Card>

        {/* 12 Strings */}
        <Card title="Strings" num="12" color="orange">
          <CodeBlock code={c12} />
        </Card>

        {/* 13 Pointers & References */}
        <Card title="Pointers & References" num="13" color="purple">
          <SectionLabel>Pointers</SectionLabel>
          <CodeBlock code={c13a} />
          <SectionLabel>References (aliases)</SectionLabel>
          <CodeBlock code={c13b} />
        </Card>

        {/* 14 Structs */}
        <Card title="Structs" num="14" color="green">
          <CodeBlock code={c14} />
        </Card>

        {/* 15 Classes (wide) */}
        <Card title="Classes (OOP Basics)" num="15" color="cyan" size="md">
          <CodeBlock code={c15} />
        </Card>

        {/* 16 Algorithms */}
        <Card title="Useful Algorithms" num="16" color="orange">
          <CodeBlock code={c16} />
        </Card>

        {/* 17 Math */}
        <Card title="Math Functions" num="17" color="yellow">
          <CodeBlock code={c17} />
        </Card>

        {/* 18 Common Mistakes (wide) */}
        <Card title="Common Beginner Mistakes" num="18" color="red" size="md">
          <InfoTable rows={[
            {
              key: "= vs ==",
              value: <>Use <code>==</code> to compare. <code>=</code> assigns a value (if (x = 5) is always true!)</>,
            },
            {
              key: "Integer division",
              value: <><code>5 / 2 == 2</code> not 2.5. Cast to double: <code>(double)5 / 2</code></>,
            },
            {
              key: "Array out of bounds",
              value: "Accessing index ≥ size causes undefined behavior — no automatic error.",
            },
            {
              key: "Missing break",
              value: <>In switch statements, forgetting <code>break</code> causes fall-through to next case.</>,
            },
            {
              key: "Uninitialized vars",
              value: "Local variables contain garbage — always initialize before use.",
            },
            {
              key: "endl vs \\n",
              value: <><code>\n</code> is faster — <code>endl</code> flushes the buffer every call.</>,
            },
          ]} />
        </Card>

        {/* 19 Compile & Run */}
        <Card title="Compile & Run" num="19" color="green">
          <SectionLabel>g++ (most common)</SectionLabel>
          <CodeBlock code={c19} />
        </Card>

        {/* 20 Dynamic Memory */}
        <Card title="Dynamic Memory" num="20" color="purple">
          <CodeBlock code={c20} />
          <Tip color="purple">
            <strong>Prefer</strong> <code>vector</code> or smart pointers (<code>unique_ptr</code>) over raw <code>new/delete</code> to avoid memory leaks.
          </Tip>
        </Card>

      </div>
    </>
  );
}

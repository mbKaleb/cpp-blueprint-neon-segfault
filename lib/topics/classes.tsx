import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_anatomy = `\
class BankAccount {
public:                          // accessible by everyone
  BankAccount(std::string owner, double initial)
    : owner_(owner), balance_(initial) {}   // member initializer list

  void deposit(double amount) {
    if (amount > 0) balance_ += amount;
  }

  bool withdraw(double amount) {
    if (amount > balance_) return false;
    balance_ -= amount;
    return true;
  }

  double balance() const { return balance_; }  // const: won't modify
  const std::string& owner() const { return owner_; }

private:                         // accessible only inside the class
  std::string owner_;
  double      balance_;          // trailing _ convention for members
};

BankAccount acc("Alice", 100.0);
acc.deposit(50.0);
acc.balance();   // 150.0
// acc.balance_ = 0;  ❌ private — compile error`;

const c_constructors = `\
class Widget {
public:
  // Default constructor
  Widget() : value_(0), name_("default") {}

  // Parameterized constructor
  Widget(int v, std::string n) : value_(v), name_(std::move(n)) {}

  // Delegating constructor (C++11) — avoids repeating init logic
  Widget(int v) : Widget(v, "unnamed") {}

  // Copy constructor (deep copy if needed)
  Widget(const Widget& other) = default;   // compiler default is fine here

  // Move constructor (C++11)
  Widget(Widget&& other) noexcept = default;

  // Copy assignment
  Widget& operator=(const Widget& other) = default;

  // Move assignment
  Widget& operator=(Widget&& other) noexcept = default;

  // Destructor
  ~Widget() = default;

  // Explicit: prevents implicit conversion from int
  explicit Widget(int v) : value_(v) {}
  // Widget w = 5;   ❌ implicit — blocked by explicit
  // Widget w{5};    ✅ direct init — allowed

private:
  int value_;
  std::string name_;
};`;

const c_raii = `\
// RAII: Resource Acquisition Is Initialization
// Acquire the resource in the constructor, release in the destructor
// Guarantees cleanup even when exceptions are thrown

class FileHandle {
public:
  explicit FileHandle(const std::string& path)
    : file_(std::fopen(path.c_str(), "r")) {
    if (!file_) throw std::runtime_error("cannot open: " + path);
  }

  ~FileHandle() {
    if (file_) std::fclose(file_);   // always runs — even on exception
  }

  // Non-copyable (resource shouldn't be duplicated)
  FileHandle(const FileHandle&) = delete;
  FileHandle& operator=(const FileHandle&) = delete;

  // Movable (transfer ownership)
  FileHandle(FileHandle&& o) noexcept : file_(o.file_) { o.file_ = nullptr; }

  FILE* get() const { return file_; }

private:
  FILE* file_;
};

{
  FileHandle f("data.txt");  // opens
  readLines(f.get());
}   // ← destructor called here — file closed automatically`;

const c_inheritance = `\
class Shape {
public:
  Shape(std::string color) : color_(color) {}
  virtual ~Shape() = default;   // ✅ virtual destructor — always for base classes

  virtual double area() const = 0;        // pure virtual — must override
  virtual std::string describe() const {  // virtual — may override
    return color_ + " shape, area=" + std::to_string(area());
  }

protected:
  std::string color_;   // accessible in derived classes, not outside
};

class Circle : public Shape {
public:
  Circle(std::string color, double r) : Shape(color), radius_(r) {}

  double area() const override {         // override — compile error if sig wrong
    return 3.14159 * radius_ * radius_;
  }

private:
  double radius_;
};

Shape* s = new Circle("red", 5.0);
s->area();        // calls Circle::area() — runtime dispatch
s->describe();    // calls Shape::describe() — calls Circle::area() through vtable
delete s;         // calls Circle::~Circle() then Shape::~Shape() — correct`;

const c_virtual = `\
// ── Virtual dispatch (runtime polymorphism) ──────────────────
// Each class with virtual functions gets a vtable (function pointer table)
// Each object stores a hidden vptr pointing to its class's vtable

class Base {
public:
  virtual void foo() { std::cout << "Base\\n"; }
  void bar()         { std::cout << "Base::bar\\n"; }  // non-virtual
};

class Derived : public Base {
public:
  void foo() override { std::cout << "Derived\\n"; }
  void bar()          { std::cout << "Derived::bar\\n"; }
};

Base* p = new Derived();
p->foo();   // "Derived" — virtual: runtime dispatch via vtable
p->bar();   // "Base::bar" — non-virtual: compile-time dispatch on Base*

// ── final — prevent further overriding or inheritance ─────────
class Leaf final : public Base {       // cannot inherit from Leaf
  void foo() override final { }        // cannot override foo in Leaf's children
};

// ── override — catch signature mistakes at compile time ───────
class Bad : public Base {
  void fooo() override { }   // ❌ typo — compile error (no Base::fooo)
};`;

const c_access = `\
class A {
public:    // accessible everywhere
  int pub = 1;
protected: // accessible in A and derived classes
  int prot = 2;
private:   // accessible only inside A
  int priv = 3;

  // friend — grants full access to a specific class or function
  friend class B;
  friend void inspect(const A&);
};

class B {
  void test(A& a) { a.priv; }   // ✅ friend has access
};

// ── Inheritance access levels ─────────────────────────────────
class PubDerived  : public    A { };  // pub→pub, prot→prot
class ProtDerived : protected A { };  // pub→prot, prot→prot
class PrivDerived : private   A { };  // pub→priv, prot→priv

// ── Static members — shared across all instances ──────────────
class Counter {
public:
  static int count;           // declaration
  Counter() { count++; }
  ~Counter() { count--; }
};
int Counter::count = 0;       // definition (C++17: inline static int count = 0 in class)`;

// ── Page component ──────────────────────────────────────────────────────────

export default function ClassesPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="OOP in C++" num="01" color="cyan" size="lg">
          <Prose>
            <H3>Classes and encapsulation</H3>
            <P>
              A <Code>class</Code> bundles data (members) and behaviour (methods) under controlled
              access. The key principle is <Code>encapsulation</Code> — hide the implementation
              details, expose only what callers need. This lets you change the internals without
              breaking any code that uses the class.
            </P>
            <Grid>
              <Cell>
                <H3>The four pillars</H3>
                <OL>
                  <LI><Code>Encapsulation</Code> — private data, public interface. Invariants are maintained inside the class.</LI>
                  <LI><Code>Inheritance</Code> — a derived class gets all members of a base class and can add or override behaviour.</LI>
                  <LI><Code>Polymorphism</Code> — virtual functions let a base pointer/reference call the derived class's override at runtime.</LI>
                  <LI><Code>Abstraction</Code> — pure virtual functions define an interface without an implementation (abstract class).</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Design rules</H3>
                <OL>
                  <LI>Always give base classes a <Code>virtual</Code> destructor — deleting a derived object through a base pointer is UB without it.</LI>
                  <LI>Mark overrides with <Code>override</Code> — the compiler catches signature mismatches that would silently create a new function.</LI>
                  <LI>Use <Code>explicit</Code> on single-argument constructors — prevents surprising implicit conversions.</LI>
                  <LI>Follow the Rule of Zero or Rule of Five — never define some special members but not others.</LI>
                </OL>
                <Note>Prefer composition over inheritance for code reuse. Inheritance is for &quot;is-a&quot; relationships; composition is for &quot;has-a&quot;.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Class Anatomy */}
        <Card title="Class Anatomy" num="02" color="cyan" size="md">
          <CodeBlock code={c_anatomy} />
          <InfoTable rows={[
            { key: "initializer list",  value: "Members are initialized before the constructor body runs. More efficient than assigning in the body. Required for const and reference members." },
            { key: "const method",      value: "Declared with const after the parameter list. this is const T* — cannot modify members." },
            { key: "trailing _",        value: "Common convention to name private members (balance_). Distinguishes from local variables and parameters." },
          ]} />
        </Card>

        {/* 03 Constructors */}
        <Card title="Constructors & Special Members" num="03" color="cyan" size="md">
          <CodeBlock code={c_constructors} />
          <InfoTable rows={[
            { key: "delegating ctor",   value: "C++11: one constructor calls another. Avoids duplicating initialization logic." },
            { key: "explicit",          value: "Prevents Widget w = 5 (implicit). Allows Widget w{5} (direct). Use on any single-arg constructor." },
            { key: "noexcept",          value: "Move operations should be noexcept — containers like vector use move only if noexcept, otherwise copy." },
            { key: "= default / delete", value: "= default: compiler generates. = delete: disabled entirely. Both appear in the declaration." },
          ]} />
          <Tip color="cyan">
            <strong>Mark move operations <code>noexcept</code>.</strong> Without it, <code>std::vector</code> may copy instead of move during reallocation — silently negating the performance benefit of move semantics.
          </Tip>
        </Card>

        {/* 04 RAII */}
        <Card title="RAII — Resource Management" num="04" color="cyan" size="md">
          <CodeBlock code={c_raii} />
          <InfoTable rows={[
            { key: "RAII",          value: "Resource Acquisition Is Initialization. Constructor acquires, destructor releases. Works correctly even when exceptions are thrown." },
            { key: "= delete copy", value: "Non-copyable resources (file handles, mutexes, sockets) should delete copy constructor and assignment." },
            { key: "move ctor",     value: "Transfer ownership by moving the resource pointer, then null out the source so the destructor is a no-op." },
            { key: "examples",      value: "std::unique_ptr, std::lock_guard, std::ifstream, std::vector — all use RAII internally." },
          ]} />
          <Tip color="cyan">
            <strong>RAII is the most important C++ idiom.</strong> It eliminates resource leaks without try/finally, even across multiple return paths and exceptions.
          </Tip>
        </Card>

        {/* 05 Inheritance & virtual */}
        <Card title="Inheritance & Virtual Dispatch" num="05" color="cyan" size="md">
          <CodeBlock code={c_inheritance} />
          <InfoTable rows={[
            { key: "virtual dtor",    value: "Required on any base class. Without it, deleting a derived object through a base pointer only calls the base destructor — resource leak." },
            { key: "= 0 (pure virtual)", value: "Makes the class abstract — cannot instantiate directly. Derived classes must provide an implementation." },
            { key: "override",        value: "Tells the compiler this must override a virtual function. Compile error if the signature doesn't match." },
            { key: "protected",       value: "Accessible in the class itself and all derived classes, but not by external code." },
          ]} />
        </Card>

        {/* 06 Virtual internals */}
        <Card title="Virtual Dispatch & final" num="06" color="cyan" size="md">
          <CodeBlock code={c_virtual} />
          <InfoTable rows={[
            { key: "vtable",     value: "A table of function pointers, one per class with virtual functions. Each object stores a hidden vptr to its class's vtable." },
            { key: "overhead",   value: "One pointer per object (vptr, 8 bytes). One indirect function call per virtual dispatch. Negligible in most code." },
            { key: "final",      value: "Prevents a class from being inherited from, or a virtual function from being overridden. Enables devirtualization optimizations." },
            { key: "non-virtual", value: "Resolved at compile time based on the static type of the pointer/reference — always calls the declared class's version." },
          ]} />
        </Card>

        {/* 07 Access & Static */}
        <Card title="Access Control · friend · static" num="07" color="cyan" size="md">
          <CodeBlock code={c_access} />
          <InfoTable rows={[
            { key: "public",     value: "Accessible everywhere. Part of the class's public interface." },
            { key: "protected",  value: "Accessible inside the class and derived classes. Not accessible externally." },
            { key: "private",    value: "Accessible only inside the class (and friends). Default for class members." },
            { key: "friend",     value: "Grants full access to a specific class or function. Use sparingly — it breaks encapsulation." },
            { key: "static",     value: "Shared across all instances. No this pointer. Define (and initialize) outside the class in a .cpp file (or inline in C++17)." },
          ]} />
        </Card>

      </div>
    </>
  );
}

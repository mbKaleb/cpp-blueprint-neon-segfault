import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_pointers = `\
int x = 10;
int* ptr = &x;    // ptr holds the address of x
*ptr;             // 10 — dereference: follow the pointer to get the value
*ptr = 20;        // x is now 20 — modifies through the pointer

// ── Null pointer ──────────────────────────────────────────────
int* p = nullptr;       // ✅ C++11 null pointer (use this)
// int* p = NULL;       // ❌ old C macro — avoid
// int* p = 0;          // ❌ ambiguous — avoid
if (p != nullptr) { *p; }  // always null-check before dereferencing

// ── Pointer to pointer ────────────────────────────────────────
int** pp = &ptr;        // holds the address of a pointer
**pp;                   // 20 — double dereference

// ── Const and pointers (read right to left) ──────────────────
const int*  cp  = &x;  // pointer to const int — can't change *cp
int* const  pc  = &x;  // const pointer to int — can't change pc
const int* const cpc = &x; // const pointer to const int — neither

// ── void pointer ─────────────────────────────────────────────
void* vp = &x;          // can hold any address
int* ip = static_cast<int*>(vp);  // must cast to dereference`;

const c_references = `\
int x = 10;
int& ref = x;   // ref IS x — same object, different name
ref = 99;        // x is now 99
&ref == &x;      // true — same address

// ── References vs pointers ───────────────────────────────────
// References: must be initialized, can't be null, can't be reseated
// Pointers:   can be null, can be reassigned, can do arithmetic

// ── Pass by reference ────────────────────────────────────────
void swap(int& a, int& b) {
  int tmp = a; a = b; b = tmp;
}
swap(x, y);   // x and y are swapped — no & needed at call site

// ── Const reference — read-only alias, no copy ───────────────
void print(const std::string& s) { std::cout << s; }
print("hello");   // no copy — string literal binds to const ref

// ── Reference to temporary (lifetime extension) ───────────────
const int& r = 42;    // ✅ const ref extends lifetime of temporary
// int& r2 = 42;      // ❌ non-const ref can't bind to temporary

// ── Rvalue reference (C++11) — move semantics ─────────────────
int&& rr = 42;         // rvalue reference to temporary
std::string&& sr = std::string("hello");  // sr owns the temporary`;

const c_smartptr = `\
#include <memory>

// ── unique_ptr — sole ownership ──────────────────────────────
std::unique_ptr<int> p = std::make_unique<int>(42);
*p;              // 42
p.get();         // raw int* (don't store — may dangle)
p.reset();       // destroy the object
p = nullptr;     // same as reset()
// Cannot copy — can only move
auto q = std::move(p);   // p is now null; q owns the int

// unique_ptr for arrays
auto arr = std::make_unique<int[]>(10);
arr[0] = 5;

// ── shared_ptr — shared ownership (reference counted) ────────
auto s1 = std::make_shared<int>(10);
auto s2 = s1;           // both point to the same int
s1.use_count();         // 2 — two owners
s2.reset();             // decrements count → 1
// Destroyed when count reaches 0

// ── weak_ptr — non-owning observer ───────────────────────────
std::weak_ptr<int> w = s1;   // doesn't increment count
if (auto locked = w.lock()) {  // lock() returns shared_ptr or null
  *locked;   // safe to use
}
// Breaks circular reference cycles between shared_ptrs`;

const c_dangling = `\
// ── Dangling pointer — points to freed memory ─────────────────
int* p = new int(42);
delete p;
*p;          // ❌ UB — use-after-free

// Fix: null after delete
delete p;
p = nullptr;
// Better fix: use unique_ptr — delete happens automatically

// ── Dangling reference ────────────────────────────────────────
int& bad() {
  int x = 5;
  return x;   // ❌ x is destroyed on return
}

// ── Stack overflow via pointer ────────────────────────────────
int arr[5];
int* p2 = &arr[5];   // past-the-end — valid to form
*p2 = 0;             // ❌ UB — out of bounds

// ── Common tools to detect these ─────────────────────────────
// -fsanitize=address   — AddressSanitizer: catches use-after-free,
//                        out-of-bounds, heap/stack overflows at runtime
// -fsanitize=undefined — catches null dereference, misaligned access
// Valgrind             — memory leak and error detector`;

const c_ptrvref = `\
//                    Pointer (T*)         Reference (T&)
// Null?              ✅ can be null        ❌ must bind to object
// Reseat?            ✅ can point elsewhere ❌ always same object
// Arithmetic?        ✅ p++, p+n, p-q      ❌ not supported
// Syntax to access   *p or p->m            x or x.m (transparent)
// Initialization     can be uninitialized  must be initialized
// Use for            optional, arrays,     aliases, out-params,
//                    dynamic allocation    const params

// ── When to use each ────────────────────────────────────────
// Pass non-optional in-param, read-only:   const T& (or string_view)
// Pass non-optional, modify caller's var:  T&
// Pass optional / nullable:                T*
// Return optional result:                  std::optional<T>
// Own heap object, sole ownership:         std::unique_ptr<T>
// Own heap object, shared:                 std::shared_ptr<T>
// Observe shared object without ownership: std::weak_ptr<T>
// Raw pointer:                             C APIs, performance-critical internals`;

const c_this = `\
class Counter {
  int count = 0;
public:
  // this — implicit pointer to the current object
  Counter& increment() {
    count++;
    return *this;    // return ref to self — enables chaining
  }

  // Const member function — this is const Counter*
  int get() const {
    return count;    // cannot modify count here
    // count++;      // ❌ compile error in const function
  }

  // Distinguish member from parameter with same name
  void setCount(int count) {
    this->count = count;   // this->count = member, count = param
  }
};

Counter c;
c.increment().increment().increment();  // chaining via *this
c.get();   // 3`;

// ── Page component ──────────────────────────────────────────────────────────

export default function PointersReferencesPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Pointers & References" num="01" color="purple" size="lg">
          <Prose>
            <H3>Indirection in C++</H3>
            <P>
              Both pointers and references provide indirect access to an object — but they differ
              in safety guarantees and capabilities. Modern C++ adds smart pointers that express
              ownership intent in the type system, eliminating most reasons to use raw <Code>new</Code> and <Code>delete</Code>.
            </P>
            <Grid>
              <Cell>
                <H3>Memory model</H3>
                <OL>
                  <LI><Code>Stack</Code> — fast, automatic lifetime. Local variables. Limited size (~1–8 MB).</LI>
                  <LI><Code>Heap</Code> — dynamic, manual (or RAII) lifetime. <Code>new</Code> / <Code>delete</Code> or smart pointers.</LI>
                  <LI>A pointer is a variable that holds an address — 8 bytes on 64-bit systems.</LI>
                  <LI>A reference is an alias — same address as the original, no extra storage.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Ownership hierarchy</H3>
                <OL>
                  <LI><Code>unique_ptr</Code> — sole owner. Zero overhead. Destroyed when it goes out of scope.</LI>
                  <LI><Code>shared_ptr</Code> — shared ownership via reference count. Small overhead per dereference.</LI>
                  <LI><Code>weak_ptr</Code> — non-owning observer. Must lock before use. Breaks cycles.</LI>
                  <LI>Raw pointer <Code>T*</Code> — no ownership. Use only as a non-owning observer or for C APIs.</LI>
                </OL>
                <Note>The rule: if you write new, wrap it in make_unique immediately. If you write delete, you&apos;re probably doing it wrong.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Pointers */}
        <Card title="Pointers" num="02" color="purple" size="md">
          <CodeBlock code={c_pointers} />
          <InfoTable rows={[
            { key: "const int* p",    value: "Pointer to const — the pointed-to value cannot be changed through p. The pointer itself can be reassigned." },
            { key: "int* const p",    value: "Const pointer — p cannot be reassigned to another address. The pointed-to value can be changed." },
            { key: "nullptr",         value: "The null pointer constant (C++11). Always prefer over NULL or 0." },
            { key: "void*",           value: "Generic pointer — holds any address. Must cast to the correct type before dereferencing." },
          ]} />
        </Card>

        {/* 03 References */}
        <Card title="References & Rvalue References" num="03" color="purple" size="md">
          <CodeBlock code={c_references} />
          <InfoTable rows={[
            { key: "int& ref = x",      value: "Lvalue reference — an alias. Must bind to an existing object. Cannot be null or reseated." },
            { key: "const T& r = tmp",  value: "Const ref to temporary extends the temporary's lifetime to match the reference's scope." },
            { key: "int&& rr",          value: "Rvalue reference — binds to temporaries. Foundation of move semantics." },
            { key: "std::move(x)",      value: "Casts x to an rvalue reference, enabling move construction/assignment. Does NOT move by itself." },
          ]} />
        </Card>

        {/* 04 Smart Pointers */}
        <Card title="Smart Pointers" num="04" color="purple" size="md">
          <CodeBlock code={c_smartptr} />
          <InfoTable rows={[
            { key: "make_unique<T>(...)",  value: "Preferred way to create a unique_ptr. Exception-safe. Never call new directly." },
            { key: "make_shared<T>(...)",  value: "Preferred way to create a shared_ptr. Single allocation for object + control block." },
            { key: "p.get()",             value: "Returns the raw pointer. Use only for C APIs. Don't store — the smart pointer still owns." },
            { key: "weak_ptr::lock()",    value: "Returns a shared_ptr if the object still exists, otherwise nullptr. Always check before use." },
          ]} />
          <Tip color="purple">
            <strong>Prefer unique_ptr by default.</strong> shared_ptr adds reference counting overhead on every copy. Only reach for shared_ptr when you genuinely need multiple owners.
          </Tip>
        </Card>

        {/* 05 Pointer vs Reference */}
        <Card title="Pointer vs Reference" num="05" color="purple" size="md">
          <CodeBlock code={c_ptrvref} />
          <InfoTable rows={[
            { key: "const T&",         value: "Non-optional read-only parameter. Accepts lvalues and temporaries. Zero overhead." },
            { key: "T&",               value: "Non-optional out/in-out parameter. Caller must pass a named variable." },
            { key: "T*",               value: "Optional (nullable) parameter. Caller passes nullptr to opt out." },
            { key: "unique_ptr<T>",    value: "Sole ownership. Function takes ownership from the caller." },
          ]} />
        </Card>

        {/* 06 Dangling & UB */}
        <Card title="Dangling Pointers & Common UB" num="06" color="purple" size="md">
          <CodeBlock code={c_dangling} />
          <InfoTable rows={[
            { key: "use-after-free",   value: "Accessing memory after delete. Caught by AddressSanitizer (-fsanitize=address)." },
            { key: "dangling ref",     value: "Returning a reference to a local variable. The local is destroyed; the caller gets garbage." },
            { key: "out-of-bounds",    value: "Accessing arr[n] or beyond. No exception — silent UB. Caught by ASan." },
            { key: "null deref",       value: "Dereferencing a nullptr. Caught by -fsanitize=undefined and ASan." },
          ]} />
          <Tip color="purple">
            <strong>Build with sanitizers during development.</strong> <code>-fsanitize=address,undefined</code> catches the majority of pointer-related bugs at runtime with minimal setup.
          </Tip>
        </Card>

        {/* 07 this pointer */}
        <Card title="The this Pointer" num="07" color="purple" size="md">
          <CodeBlock code={c_this} />
          <InfoTable rows={[
            { key: "this",          value: "Implicit pointer to the current object inside a member function. Type: T* (or const T* in const methods)." },
            { key: "return *this",  value: "Returns the object by reference — enables method chaining (builder pattern)." },
            { key: "const method",  value: "Declared with const after the parameter list. this is const T* — cannot modify data members." },
            { key: "this->member",  value: "Disambiguates when a local parameter shadows a data member of the same name." },
          ]} />
        </Card>

      </div>
    </>
  );
}

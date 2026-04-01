import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_heap = `\
// ── new / delete — single object ─────────────────────────────
int* p = new int(42);   // allocate + initialize
*p;                      // 42
delete p;                // release memory
p = nullptr;             // good practice: null after delete

// ── new[] / delete[] — arrays ────────────────────────────────
int* arr = new int[10]{};   // 10 zero-initialized ints
arr[0] = 5;
delete[] arr;               // must use delete[], not delete

// ── Placement new — construct into existing memory ────────────
alignas(int) char buf[sizeof(int)];
int* p2 = new (buf) int(99);   // constructs in buf — no heap alloc
p2->~int();                     // must call destructor manually

// ── operator new / operator delete — raw allocation ──────────
void* raw = ::operator new(sizeof(MyClass));
MyClass* obj = new (raw) MyClass(args);
obj->~MyClass();
::operator delete(raw);

// ⚠ new throws std::bad_alloc if allocation fails
// Use new (std::nothrow) T to get nullptr instead of exception
int* safe = new (std::nothrow) int(5);
if (!safe) { /* handle OOM */ }`;

const c_unique = `\
#include <memory>

// ── unique_ptr — sole ownership, zero overhead ───────────────
auto p = std::make_unique<int>(42);   // preferred — exception safe
*p;            // 42
p.get();       // raw int* (non-owning)
p.reset();     // destroy object; p becomes null
p = nullptr;   // same as reset()

// Transfer ownership — source becomes null
auto q = std::move(p);   // p=null, q owns the int

// unique_ptr for arrays
auto arr = std::make_unique<int[]>(10);
arr[5] = 99;   // operator[] defined for array form

// Custom deleter
auto file = std::unique_ptr<FILE, decltype(&fclose)>(
  fopen("data.txt", "r"), fclose);  // fclose called on destruction

// ── Returning from a factory ──────────────────────────────────
std::unique_ptr<Shape> makeShape(std::string_view type) {
  if (type == "circle")  return std::make_unique<Circle>(5.0);
  if (type == "square")  return std::make_unique<Square>(3.0);
  return nullptr;
}

auto shape = makeShape("circle");
shape->area();   // virtual dispatch still works through unique_ptr`;

const c_shared = `\
#include <memory>

// ── shared_ptr — shared ownership via reference count ────────
auto s1 = std::make_shared<int>(10);  // count=1
auto s2 = s1;                          // count=2  (copy)
auto s3 = s1;                          // count=3
s1.use_count();   // 3

s1.reset();       // count=2; object still alive
s2.reset();       // count=1
s3.reset();       // count=0 → object destroyed

// shared_ptr is copyable — unique_ptr is not
void register(std::shared_ptr<Widget> w) { cache.push_back(w); }

// ── make_shared vs new ────────────────────────────────────────
// make_shared: one allocation for object + control block (faster)
auto good = std::make_shared<int>(5);    // ✅ single alloc
// shared_ptr<int> bad(new int(5));      // ⚠ two allocs

// ── Circular reference — memory leak! ────────────────────────
struct Node {
  std::shared_ptr<Node> next;  // ❌ if two nodes point to each other,
};                              //    neither ref count reaches zero`;

const c_weak = `\
#include <memory>

// weak_ptr — non-owning observer of a shared_ptr
// Doesn't increment the reference count
// Must be "locked" to use — returns null if object was destroyed

struct Cache {
  std::weak_ptr<Resource> cached;

  std::shared_ptr<Resource> get() {
    if (auto r = cached.lock()) {  // lock() → shared_ptr or null
      return r;   // object still alive
    }
    return nullptr;  // object was destroyed
  }
};

// ── Breaking circular references ──────────────────────────────
struct Node {
  std::shared_ptr<Node> next;
  std::weak_ptr<Node>   prev;   // ✅ weak breaks the cycle
};

// ── Observer pattern ──────────────────────────────────────────
class EventSource {
  std::vector<std::weak_ptr<Listener>> listeners_;
public:
  void notify() {
    listeners_.erase(
      std::remove_if(listeners_.begin(), listeners_.end(),
        [](auto& w){ return w.expired(); }),
      listeners_.end());
    for (auto& w : listeners_)
      if (auto l = w.lock()) l->onEvent();
  }
};`;

const c_pool = `\
// ── Stack allocation (no heap at all) ────────────────────────
int arr[1000];        // 4 KB on the stack — instant, no overhead
std::array<int,1000> a; // same, with bounds checking

// ── Custom allocator (advanced) ───────────────────────────────
// Standard containers accept an allocator as the second template param
// Useful for: arenas, pools, logging allocation, embedded systems

// ── Object pool — reuse fixed-size blocks ─────────────────────
template<typename T, std::size_t N>
class Pool {
  alignas(T) char storage_[N * sizeof(T)];
  std::stack<T*> free_;
public:
  Pool() {
    for (std::size_t i = 0; i < N; i++)
      free_.push(reinterpret_cast<T*>(storage_) + i);
  }
  T* alloc() { auto p = free_.top(); free_.pop(); return p; }
  void free(T* p) { p->~T(); free_.push(p); }
};

// ── std::pmr (C++17) — polymorphic memory resources ──────────
#include <memory_resource>
std::pmr::monotonic_buffer_resource pool(1024);
std::pmr::vector<int> v{&pool};   // v allocates from pool, no heap`;

const c_ownership = `\
// ── The ownership decision tree ──────────────────────────────

// Is the object shared between multiple owners?
//   Yes → shared_ptr<T>
//   No  → unique_ptr<T>  (or stack allocation if small + short-lived)

// Do you need a non-owning reference to a shared object?
//   → weak_ptr<T> (safe, checks if alive)
//   → raw T*      (unsafe, only if lifetime is well-known)

// Is the object large or needs to outlive the current scope?
//   → heap allocation (unique_ptr or shared_ptr)
//   Otherwise → stack or member variable

// ── When raw new/delete is acceptable ────────────────────────
// 1. Inside a custom smart pointer or container (you're building RAII)
// 2. Placement new for custom memory management
// 3. Rare performance-critical code after profiling
// ⚠ Never: raw new in application code where a smart pointer works

// ── Summary ───────────────────────────────────────────────────
// unique_ptr → 95% of heap allocation needs
// shared_ptr → shared ownership between components
// weak_ptr   → caches, observers, cycle-breaking
// raw ptr    → non-owning views only`;

// ── Page component ──────────────────────────────────────────────────────────

export default function DynamicMemoryPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Dynamic Memory in C++" num="01" color="purple" size="lg">
          <Prose>
            <H3>Stack vs Heap</H3>
            <P>
              Local variables live on the <Code>stack</Code> — fast, automatically managed, limited
              in size (~1–8 MB). Objects that need to outlive their scope, be shared, or are too
              large for the stack go on the <Code>heap</Code> — managed with <Code>new</Code> /
              <Code>delete</Code> or (preferably) smart pointers.
            </P>
            <Grid>
              <Cell>
                <H3>The ownership model</H3>
                <OL>
                  <LI>Every heap object must have exactly one owner responsible for its deletion.</LI>
                  <LI><Code>unique_ptr</Code> — single owner. Zero overhead. Deleted when it goes out of scope.</LI>
                  <LI><Code>shared_ptr</Code> — multiple owners. Reference-counted. Deleted when count hits zero.</LI>
                  <LI><Code>weak_ptr</Code> — non-owner observer. Must lock before use. Breaks cycles.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Rules</H3>
                <OL>
                  <LI>Never use raw <Code>new</Code> in application code — wrap immediately in a smart pointer.</LI>
                  <LI><Code>new[]</Code> must be paired with <Code>delete[]</Code>, never plain <Code>delete</Code>.</LI>
                  <LI>Prefer <Code>make_unique</Code> / <Code>make_shared</Code> over <Code>new</Code> — they are exception-safe and (for shared_ptr) more efficient.</LI>
                  <LI>Use <Code>std::vector</Code> instead of <Code>new T[]</Code> — it manages its own memory.</LI>
                </OL>
                <Note>If you find yourself writing delete, you are almost certainly doing it wrong. Let RAII and smart pointers handle cleanup.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 new / delete */}
        <Card title="new & delete" num="02" color="purple" size="md">
          <CodeBlock code={c_heap} />
          <InfoTable rows={[
            { key: "new T(args)",      value: "Allocates heap memory and constructs T. Throws std::bad_alloc on failure." },
            { key: "delete p",         value: "Calls destructor then frees memory. Always null p afterward to prevent double-delete." },
            { key: "new T[n]",         value: "Allocates array. Must be freed with delete[], not delete." },
            { key: "placement new",    value: "Constructs an object in pre-allocated memory. No heap allocation. Must call destructor manually." },
            { key: "new (nothrow)",    value: "Returns nullptr instead of throwing on allocation failure. Use in memory-constrained environments." },
          ]} />
          <Tip color="purple">
            <strong>Always use <code>make_unique</code> instead of <code>new</code>.</strong> Raw <code>new</code> in application code is a code smell — it requires manual <code>delete</code> and is not exception-safe.
          </Tip>
        </Card>

        {/* 03 unique_ptr */}
        <Card title="unique_ptr" num="03" color="purple" size="md">
          <CodeBlock code={c_unique} />
          <InfoTable rows={[
            { key: "make_unique<T>",   value: "Preferred construction. Exception-safe. Equivalent to unique_ptr<T>(new T(args)) but cleaner." },
            { key: "std::move(p)",     value: "Transfers ownership. Source becomes null. unique_ptr cannot be copied — only moved." },
            { key: "p.get()",          value: "Raw non-owning pointer. Use for C APIs. Don't store — may dangle after unique_ptr is reset." },
            { key: "custom deleter",   value: "Second template param specifies the deleter type. Use for FILE*, handles, C resources." },
          ]} />
        </Card>

        {/* 04 shared_ptr */}
        <Card title="shared_ptr" num="04" color="purple" size="md">
          <CodeBlock code={c_shared} />
          <InfoTable rows={[
            { key: "use_count()",      value: "Current reference count. Useful for debugging — don't base logic on it in production." },
            { key: "make_shared",      value: "Single allocation for object + control block. Faster than shared_ptr<T>(new T). Preferred." },
            { key: "circular refs",    value: "If A holds shared_ptr<B> and B holds shared_ptr<A>, neither count reaches zero — memory leak. Use weak_ptr for back-references." },
            { key: "thread safety",    value: "The control block (ref count) is thread-safe. The pointed-to object is NOT — protect with a mutex." },
          ]} />
          <Tip color="purple">
            <strong>shared_ptr is not free.</strong> Every copy increments an atomic counter. Prefer <code>unique_ptr</code> and pass by raw pointer/reference for non-owning access.
          </Tip>
        </Card>

        {/* 05 weak_ptr */}
        <Card title="weak_ptr" num="05" color="purple" size="md">
          <CodeBlock code={c_weak} />
          <InfoTable rows={[
            { key: "w.lock()",       value: "Returns shared_ptr if the object exists, nullptr if it was destroyed. Always check the result." },
            { key: "w.expired()",    value: "Returns true if the managed object has been destroyed. Faster than lock() when you only need to check." },
            { key: "cycle breaking", value: "In a parent-child graph, parent owns children (shared_ptr), children reference parent (weak_ptr) — no cycle." },
            { key: "observer lists", value: "Store weak_ptr in observer/listener lists — dead observers are automatically skippable without crashing." },
          ]} />
        </Card>

        {/* 06 Ownership Guide */}
        <Card title="Ownership Decision Guide" num="06" color="purple" size="md">
          <CodeBlock code={c_ownership} />
          <InfoTable rows={[
            { key: "unique_ptr",  value: "Default choice for heap allocation. Zero overhead over raw pointer. 95% of cases." },
            { key: "shared_ptr",  value: "Use when multiple components genuinely need to co-own an object's lifetime." },
            { key: "weak_ptr",    value: "Caches, observer lists, parent back-references — anywhere you need to observe without owning." },
            { key: "raw T*",      value: "Non-owning view only. Acceptable when lifetime is guaranteed by the caller (e.g. passing to a function)." },
          ]} />
        </Card>

        {/* 07 Advanced / Pools */}
        <Card title="Advanced: Pools & PMR" num="07" color="purple" size="md">
          <CodeBlock code={c_pool} />
          <InfoTable rows={[
            { key: "stack alloc",          value: "Fastest — no heap, no overhead. Use for small, short-lived objects. Limited to ~1–8 MB total." },
            { key: "object pool",          value: "Pre-allocate N slots, reuse without calling the system allocator. Eliminates heap fragmentation." },
            { key: "std::pmr (C++17)",     value: "Polymorphic memory resources — swap the allocator behind a container at runtime. Great for arenas and pools." },
            { key: "monotonic_buffer",     value: "Bump allocator — allocations are O(1), no individual frees. Free everything at once by destroying the resource." },
          ]} />
          <Tip color="purple">
            <strong>Profile before optimizing allocation.</strong> For most programs, <code>make_unique</code> and <code>vector</code> are fast enough. Custom allocators give large gains only in allocation-heavy hot paths.
          </Tip>
        </Card>

      </div>
    </>
  );
}

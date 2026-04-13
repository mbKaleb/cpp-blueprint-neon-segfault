import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_pipeline = `\
# The four stages of compilation

# 1. Preprocessing — expands #include, #define, #if
g++ -E main.cpp -o main.i       # output: preprocessed source

# 2. Compilation — source → assembly
g++ -S main.i -o main.s         # output: assembly (.s)

# 3. Assembly — assembly → object file
g++ -c main.cpp -o main.o       # output: object file (.o)

# 4. Linking — object files + libraries → executable
g++ main.o utils.o -o myapp     # output: executable

# All at once (usual workflow)
g++ -std=c++17 main.cpp -o myapp

# Multiple source files
g++ -std=c++17 main.cpp utils.cpp math.cpp -o myapp`;

const c_flags = `\
# ── Standard version ──────────────────────────────────────────
g++ -std=c++17   # C++17 (recommended minimum)
g++ -std=c++20   # C++20 (ranges, format, concepts)
g++ -std=c++23   # C++23 (latest)

# ── Warning flags ──────────────────────────────────────────────
-Wall            # core warnings (unused vars, implicit fallthrough, …)
-Wextra          # additional warnings on top of -Wall
-Wpedantic       # reject non-standard extensions
-Wconversion     # warn on implicit narrowing conversions
-Wshadow         # warn when a local shadows an outer variable
-Werror          # treat all warnings as errors

# ── Optimization ──────────────────────────────────────────────
-O0   # no optimization (fastest compile, easiest to debug)
-O1   # basic optimizations
-O2   # standard release build — good balance
-O3   # aggressive (may increase binary size)
-Os   # optimize for binary size
-Og   # debug-friendly optimization (GCC) — better than -O0 for debugging

# ── Debug symbols ─────────────────────────────────────────────
-g    # include DWARF debug info (gdb / lldb)
-g3   # include macro definitions too

# ── Recommended builds ─────────────────────────────────────────
# Development:
g++ -std=c++17 -O1 -g -fsanitize=address,undefined -Wall -Wextra -Werror
# Release:
g++ -std=c++17 -O2 -DNDEBUG -Wall -Wextra -Werror`;

const c_sanitizers = `\
# ── AddressSanitizer (ASan) ───────────────────────────────────
g++ -fsanitize=address -g -O1 main.cpp -o app
# Detects: heap/stack OOB, use-after-free, double-free, leaks
# Overhead: ~2× memory, ~2× runtime

# ── UBSanitizer (UBSan) ───────────────────────────────────────
g++ -fsanitize=undefined -g -O1 main.cpp -o app
# Detects: signed overflow, null deref, misaligned access, invalid cast
# Overhead: ~1.1× (very low)

# ── ThreadSanitizer (TSan) — combine with caution ─────────────
g++ -fsanitize=thread -g -O1 main.cpp -o app
# Detects: data races between threads
# ⚠ Incompatible with ASan — run separately

# ── Combine ASan + UBSan ──────────────────────────────────────
g++ -fsanitize=address,undefined -g -O1 main.cpp -o app

# ── Control sanitizer behavior at runtime ─────────────────────
ASAN_OPTIONS=detect_leaks=1 ./app
UBSAN_OPTIONS=print_stacktrace=1 ./app`;

const c_cmake = `\
# CMakeLists.txt — minimal modern CMake project
cmake_minimum_required(VERSION 3.20)
project(MyApp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)   # disable GNU extensions

add_executable(myapp
    src/main.cpp
    src/utils.cpp
)

target_compile_options(myapp PRIVATE
    -Wall -Wextra -Wpedantic
)

# Build & run
# mkdir build && cd build
# cmake ..
# cmake --build .
# ./myapp

# Debug build with sanitizers
# cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..

# Release build
# cmake -DCMAKE_BUILD_TYPE=Release ..`;

const c_gdb = `\
# Compile with debug symbols
g++ -g -O0 main.cpp -o app

# ── GDB basics ────────────────────────────────────────────────
gdb ./app             # start debugger
run                   # run the program
run arg1 arg2         # run with arguments

break main            # set breakpoint at function
break main.cpp:42     # set breakpoint at line 42
info breakpoints      # list all breakpoints
delete 1              # delete breakpoint 1

next    (n)           # execute next line (step over)
step    (s)           # step into function
finish                # run until current function returns
continue (c)          # continue to next breakpoint

print x               # print variable value
print *ptr            # print value at pointer
info locals           # print all local variables
backtrace (bt)        # show call stack

# ── LLDB (macOS) equivalents ─────────────────────────────────
lldb ./app
breakpoint set --name main
process launch
thread step-over   (n)
thread step-in     (s)
frame variable     # info locals equivalent`;

const c_makefiles = `\
# Makefile — simple build system for small projects
CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -Werror -O2

# Default target
all: myapp

# Link
myapp: main.o utils.o
\t$(CXX) $(CXXFLAGS) -o $@ $^

# Compile (pattern rule)
%.o: %.cpp
\t$(CXX) $(CXXFLAGS) -c -o $@ $<

# Clean
clean:
\trm -f *.o myapp

.PHONY: all clean

# Usage:
# make          — build
# make clean    — remove build artifacts
# make -j4      — build with 4 parallel jobs`;

// ── Page component ──────────────────────────────────────────────────────────

export default function CompileRunPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="Compilation Pipeline" num="01" color="green" size="lg">
          <Prose>
            <H3>From source to executable</H3>
            <P>
              C++ compilation is a four-stage pipeline. Understanding each stage helps you interpret
              error messages, choose the right flags, and understand why headers must be included
              in every translation unit that uses them.
            </P>
            <Grid>
              <Cell>
                <H3>The four stages</H3>
                <OL>
                  <LI><Code>Preprocessing</Code> — expands <Code>#include</Code>, <Code>#define</Code>, conditional compilation. Output is plain C++ text.</LI>
                  <LI><Code>Compilation</Code> — parses C++, type-checks, generates assembly. Each <Code>.cpp</Code> is compiled independently.</LI>
                  <LI><Code>Assembly</Code> — converts assembly text to machine-code object files (<Code>.o</Code> / <Code>.obj</Code>).</LI>
                  <LI><Code>Linking</Code> — resolves cross-file references, combines objects and libraries into one executable.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Common errors by stage</H3>
                <OL>
                  <LI><Code>Preprocessor</Code>: file not found, missing include guard, macro redefinition.</LI>
                  <LI><Code>Compiler</Code>: syntax errors, type mismatches, undeclared identifiers — line numbers are accurate.</LI>
                  <LI><Code>Linker</Code>: undefined reference — function declared but not defined anywhere; multiple definition — ODR violation.</LI>
                  <LI><Code>Runtime</Code>: segfault, assertion failure, exception — use sanitizers and debugger to trace.</LI>
                </OL>
                <Note>Linker errors reference mangled symbol names. Tools like c++filt can demangle them: echo "_ZN3FooC1Ev" | c++filt → Foo::Foo()</Note>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_pipeline} />
        </Card>

        {/* 02 Flags */}
        <Card title="Compiler Flags" num="02" color="green" size="md">
          <CodeBlock code={c_flags} />
          <InfoTable rows={[
            { key: "-std=c++17",  value: "Enable C++17. Use -std=c++20 for ranges, concepts, format. Always specify explicitly." },
            { key: "-Wall -Wextra", value: "Enable core and extra warnings. Together they catch ~80% of common mistakes at compile time." },
            { key: "-Werror",     value: "Treat all warnings as errors. Enforces a zero-warning policy in the codebase." },
            { key: "-O2",         value: "Standard release optimization. -O3 is rarely faster and can increase binary size significantly." },
            { key: "-DNDEBUG",    value: "Disables assert() in release builds. Define alongside -O2 for production." },
          ]} />
        </Card>

        {/* 03 Sanitizers */}
        <Card title="Runtime Sanitizers" num="03" color="green" size="md">
          <CodeBlock code={c_sanitizers} />
          <InfoTable rows={[
            { key: "ASan",   value: "AddressSanitizer — heap/stack OOB, use-after-free, leaks. ~2× overhead. Enable in CI." },
            { key: "UBSan",  value: "UBSanitizer — signed overflow, null deref, misalignment. Very low overhead (~1.1×)." },
            { key: "TSan",   value: "ThreadSanitizer — data races. Cannot combine with ASan. Run multithreaded tests separately." },
            { key: "-O1",    value: "Use -O1 not -O0 with sanitizers — some bugs only appear with minimal optimization and the error messages are clearer." },
          ]} />
          <Tip color="green">
            <strong>Add sanitizers to your CI pipeline.</strong> <code>-fsanitize=address,undefined</code> on every test run catches the majority of memory and UB bugs before they reach production.
          </Tip>
        </Card>

        {/* 04 CMake */}
        <Card title="CMake" num="04" color="green" size="md">
          <CodeBlock code={c_cmake} />
          <InfoTable rows={[
            { key: "cmake_minimum_required", value: "Always specify — CMake behavior changes significantly between versions." },
            { key: "CXX_EXTENSIONS OFF",     value: "Disables GNU extensions (__int128, VLAs, etc.) for strict standard conformance." },
            { key: "target_compile_options",  value: "Apply flags to a specific target, not globally. Prefer target_* over global set() commands." },
            { key: "BUILD_TYPE",             value: "Debug / Release / RelWithDebInfo / MinSizeRel. Set at configure time with -DCMAKE_BUILD_TYPE=Release." },
          ]} />
        </Card>

        {/* 05 Debugging */}
        <Card title="Debugging with GDB & LLDB" num="05" color="green" size="md">
          <CodeBlock code={c_gdb} />
          <InfoTable rows={[
            { key: "break / b",   value: "Set a breakpoint at a function name or file:line. Execution pauses there." },
            { key: "next / n",    value: "Execute the next line, stepping over function calls." },
            { key: "step / s",    value: "Execute the next line, stepping into function calls." },
            { key: "backtrace",   value: "Show the call stack at the current point — essential for diagnosing crashes." },
            { key: "print / p",   value: "Print the value of any expression, variable, or dereferenced pointer." },
          ]} />
        </Card>

        {/* 06 Makefiles */}
        <Card title="Makefile Basics" num="06" color="green" size="md">
          <CodeBlock code={c_makefiles} />
          <InfoTable rows={[
            { key: "$@",   value: "The target name of the current rule." },
            { key: "$^",   value: "All prerequisites (dependencies) of the current rule." },
            { key: "$<",   value: "The first prerequisite — typically the source file in a compile rule." },
            { key: "%.o: %.cpp", value: "Pattern rule — matches any .o target and compiles from the matching .cpp." },
            { key: ".PHONY",     value: "Declares targets that are not files (all, clean). Prevents conflicts with same-named files." },
          ]} />
          <Tip color="green">
            <strong>Use CMake for anything beyond a few files.</strong> Makefiles are fine for small projects, but CMake handles dependencies, cross-platform builds, and IDE integration automatically.
          </Tip>
        </Card>

      </div>
    </>
  );
}

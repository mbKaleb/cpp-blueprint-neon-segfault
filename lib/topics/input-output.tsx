import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import SectionLabel from "@/components/sheet/SectionLabel";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_streams = `\
// The four standard stream objects (always available via <iostream>)
std::cin      // standard input  — connected to keyboard by default
std::cout     // standard output — connected to terminal by default
std::cerr     // standard error  — unbuffered, flushes immediately
std::clog     // standard error  — buffered (faster for logging)

// Chaining — operator<< / >> return the stream, so you can chain:
std::cout << "x=" << x << ", y=" << y << "\\n";
std::cin  >> a >> b >> c;    // reads whitespace-separated tokens

// endl vs \\n
std::cout << "line\\n";      // fast — writes newline only
std::cout << "line" << std::endl;  // slow — writes newline + flushes buffer

// cerr for errors (always reaches the terminal even if cout is redirected)
std::cerr << "Error: file not found\\n";`;

const c_format = `\
#include <iomanip>   // all manipulators live here

double pi = 3.14159265358979;
int n = 255;

// ── Floating-point ──────────────────────────────────────────
std::cout << std::fixed      << std::setprecision(2) << pi; // 3.14
std::cout << std::scientific << std::setprecision(3) << pi; // 3.142e+00
std::cout << std::defaultfloat;  // reset to default notation

// ── Integer bases ───────────────────────────────────────────
std::cout << std::dec << n;   // 255  (decimal, default)
std::cout << std::hex << n;   // ff
std::cout << std::oct << n;   // 377
std::cout << std::uppercase << std::hex << n;  // FF
std::cout << std::showbase  << std::hex << n;  // 0xff

// ── Width & fill ────────────────────────────────────────────
std::cout << std::setw(8) << 42;          //       42  (right-aligned)
std::cout << std::left << std::setw(8) << 42;   // 42      (left-aligned)
std::cout << std::setfill('0') << std::setw(5) << 42;  // 00042

// Note: setw() resets after ONE output — must repeat each time
// setfill(), setprecision(), bases — persist until changed`;

const c_cin = `\
int x;
std::cin >> x;               // reads one int, skips leading whitespace

std::string word;
std::cin >> word;            // reads one whitespace-delimited token

std::string line;
std::getline(std::cin, line); // reads entire line including spaces

// ── Mixing >> and getline — classic pitfall ──────────────────
int age;
std::cin >> age;             // reads number, leaves '\\n' in buffer
std::cin.ignore();           // discard the leftover newline
std::getline(std::cin, line); // now reads correctly

// ── Reading until EOF ────────────────────────────────────────
int val;
while (std::cin >> val) {    // loop exits on EOF or bad input
  sum += val;
}

// ── Error recovery ───────────────────────────────────────────
if (std::cin.fail()) {
  std::cin.clear();            // reset error flags
  std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
}`;

const c_files = `\
#include <fstream>

// ── Writing to a file ────────────────────────────────────────
std::ofstream out("data.txt");          // opens for writing (truncates)
std::ofstream app("log.txt", std::ios::app);  // append mode

if (!out) { std::cerr << "Cannot open file\\n"; }

out << "Hello, file!\\n";
out << std::fixed << std::setprecision(2) << 3.14;
out.close();   // optional — destructor closes automatically

// ── Reading from a file ──────────────────────────────────────
std::ifstream in("data.txt");

std::string line;
while (std::getline(in, line)) {        // line-by-line
  std::cout << line << "\\n";
}

int val;
while (in >> val) { /* token-by-token */ }

// ── Read/write (fstream) ─────────────────────────────────────
std::fstream file("data.bin", std::ios::in | std::ios::out | std::ios::binary);

// File open modes (combine with |)
// ios::in      read     ios::out   write    ios::app   append
// ios::trunc   truncate ios::binary binary mode`;

const c_sstream = `\
#include <sstream>

// ── ostringstream — build a string with << ───────────────────
std::ostringstream oss;
oss << "User: " << name << ", Score: " << std::setw(4) << score;
std::string result = oss.str();

// ── istringstream — parse a string with >> ───────────────────
std::string data = "10 3.14 hello";
std::istringstream iss(data);
int i; double d; std::string s;
iss >> i >> d >> s;     // i=10, d=3.14, s="hello"

// ── stringstream — read and write ───────────────────────────
std::stringstream ss;
ss << 42;
int n;
ss >> n;    // round-trip: int → string → int

// ── Common patterns ──────────────────────────────────────────
// String → number (prefer stoi/stod for simple cases)
int val = std::stoi("123");
double x = std::stod("3.14");

// Number → string (prefer to_string for simple cases)
std::string s2 = std::to_string(255);   // "255"`;

const c_perf = `\
// ── Decouple C and C++ I/O (huge speedup in competitive programming)
std::ios::sync_with_stdio(false);  // disable C/C++ stream sync
std::cin.tie(nullptr);             // untie cin from cout

// ⚠ After these calls: do NOT mix printf/scanf with cin/cout

// ── Use \\n instead of endl
// endl = \\n + flush — flushing is expensive on every line
// \\n   = just a newline character — buffered, fast

// ── printf / scanf — still fastest for simple formatted I/O
#include <cstdio>
printf("x = %d, pi = %.4f\\n", x, 3.14159);
scanf("%d", &x);

// Format specifiers
// %d  int      %ld  long      %lld  long long
// %f  float    %lf  double    %s    char*
// %c  char     %x   hex       %05d  zero-padded width 5

// ── C++20: std::format (like Python's f-strings)
#include <format>
std::string s = std::format("x = {}, pi = {:.4f}", x, 3.14159);
std::cout << std::format("{:>8} | {:<12} | {:06.2f}\\n", id, name, score);`;

// ── Page component ──────────────────────────────────────────────────────────

export default function InputOutputPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Stream Overview */}
        <Card title="The iostream Model" num="01" color="green" size="lg">
          <Prose>
            <H3>Streams as abstractions</H3>
            <P>
              A <Code>stream</Code> is a sequence of bytes flowing in one direction. C++ wraps every
              I/O source and destination — terminal, file, string, network socket — behind the same
              interface: <Code>operator&lt;&lt;</Code> to write, <Code>operator&gt;&gt;</Code> to read.
              Switch targets by swapping the stream object; your formatting code stays the same.
            </P>
            <Grid>
              <Cell>
                <H3>Standard streams</H3>
                <OL>
                  <LI><Code>std::cin</Code> — standard input. Connected to keyboard; reads whitespace-delimited tokens.</LI>
                  <LI><Code>std::cout</Code> — standard output. Buffered for performance; flushed on <Code>endl</Code> or program exit.</LI>
                  <LI><Code>std::cerr</Code> — standard error. Unbuffered — writes appear immediately even if cout is redirected.</LI>
                  <LI><Code>std::clog</Code> — buffered error log. Same destination as cerr but batched for efficiency.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Stream state flags</H3>
                <OL>
                  <LI><Code>goodbit</Code> — no errors; stream is ready for I/O.</LI>
                  <LI><Code>eofbit</Code> — end-of-file reached. Further reads will fail.</LI>
                  <LI><Code>failbit</Code> — logical error (e.g., reading letters into an int).</LI>
                  <LI><Code>badbit</Code> — unrecoverable hardware/system error.</LI>
                </OL>
                <Note>Check with <Code>if (stream)</Code> or <Code>stream.good()</Code>. Reset with <Code>stream.clear()</Code>.</Note>
              </Cell>
            </Grid>
          </Prose>
          <CodeBlock code={c_streams} />
        </Card>

        {/* 02 Formatting */}
        <Card title="Output Formatting (iomanip)" num="02" color="green" size="md">
          <CodeBlock code={c_format} />
          <InfoTable rows={[
            { key: "setprecision(n)",  value: "Number of significant digits (default) or decimal places (fixed/scientific)." },
            { key: "fixed",            value: "Always show decimal point with exactly setprecision() decimal places." },
            { key: "scientific",       value: "Exponential notation: 3.14e+00." },
            { key: "setw(n)",          value: "Minimum field width for next output ONLY — does not persist." },
            { key: "setfill(c)",       value: "Fill character used when output is shorter than setw(). Default is space. Persists." },
            { key: "left / right",     value: "Alignment within the field set by setw(). Persists until changed." },
          ]} />
          <Tip color="green">
            <strong>setw() resets after one use.</strong> All other manipulators (<code>fixed</code>, <code>setprecision</code>, <code>setfill</code>, bases) persist until you explicitly change them.
          </Tip>
        </Card>

        {/* 03 cin & Input */}
        <Card title="cin & Input Handling" num="03" color="green" size="md">
          <CodeBlock code={c_cin} />
          <InfoTable rows={[
            { key: "cin >> x",           value: "Skips whitespace, reads one token. Stops at next whitespace." },
            { key: "getline(cin, s)",     value: "Reads until newline (consuming it). Includes spaces in the result." },
            { key: "cin.ignore()",        value: "Discards one character from the buffer — use after >> to clear the leftover newline before getline." },
            { key: "cin.fail()",          value: "True if last operation failed (bad type, EOF). Must clear() before next read." },
            { key: "cin.clear()",         value: "Resets all error flags. Pair with ignore() to discard bad input." },
          ]} />
          <Tip color="green">
            <strong>Always validate input.</strong> If <code>cin &gt;&gt; x</code> fails (wrong type), the stream enters a fail state and all subsequent reads silently do nothing until you call <code>clear()</code>.
          </Tip>
        </Card>

        {/* 04 File I/O */}
        <Card title="File I/O (fstream)" num="04" color="green" size="md">
          <CodeBlock code={c_files} />
          <InfoTable rows={[
            { key: "ifstream",      value: "Read-only file stream. Fails silently if file doesn't exist — always check!" },
            { key: "ofstream",      value: "Write-only. Creates file if missing; truncates existing file by default." },
            { key: "fstream",       value: "Read+write. Must specify open mode flags explicitly." },
            { key: "ios::app",      value: "Append mode — seek to end before each write. File is not truncated." },
            { key: "ios::binary",   value: "Binary mode — disables newline translation on Windows." },
          ]} />
          <Tip color="green">
            <strong>RAII closes for you.</strong> File streams close automatically when they go out of scope. Explicit <code>.close()</code> is only needed when you want to reopen or check for write errors before the destructor runs.
          </Tip>
        </Card>

        {/* 05 String Streams */}
        <Card title="String Streams (sstream)" num="05" color="green" size="md">
          <SectionLabel>In-memory I/O — format or parse strings</SectionLabel>
          <CodeBlock code={c_sstream} />
          <InfoTable rows={[
            { key: "ostringstream",  value: "Build a formatted string with <<. Call .str() to get the result." },
            { key: "istringstream",  value: "Parse a string with >>. Great for splitting space-delimited data." },
            { key: "stringstream",   value: "Both directions. Useful for type-safe number↔string conversion." },
          ]} />
        </Card>

        {/* 06 Performance & printf */}
        <Card title="Performance & std::format" num="06" color="green" size="md">
          <CodeBlock code={c_perf} />
          <InfoTable rows={[
            { key: "sync_with_stdio(false)", value: "Decouples C and C++ I/O buffers. ~3-5× faster cin/cout. Do this once at the start of main()." },
            { key: "cin.tie(nullptr)",        value: "Stops cout from auto-flushing before each cin read. Faster when mixing input and output." },
            { key: "printf / scanf",          value: "Still the fastest for simple formatted I/O. No type safety — format string must match args." },
            { key: "std::format (C++20)",     value: "Type-safe, Python-style formatting. Compile-time format string checking. Prefer over printf when available." },
          ]} />
          <Tip color="green">
            <strong>Competitive programming fast I/O:</strong> put <code>ios::sync_with_stdio(false)</code> and <code>cin.tie(nullptr)</code> at the top of <code>main()</code> and use <code>\n</code> instead of <code>endl</code> — often the difference between TLE and AC.
          </Tip>
        </Card>

      </div>
    </>
  );
}

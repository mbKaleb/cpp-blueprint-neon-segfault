import Card from "@/components/sheet/Card";
import CodeBlock from "@/components/sheet/CodeBlock";
import InfoTable from "@/components/sheet/InfoTable";
import Tip from "@/components/sheet/Tip";
import { Prose, H3, P, OL, LI, Code, Note, Grid, Cell } from "@/components/sheet/Prose";

// ── Code strings ────────────────────────────────────────────────────────────

const c_construction = `\
#include <string>
using std::string;

// Construction
string a = "hello";           // from string literal
string b("hello", 3);         // "hel" — first 3 chars
string c(5, 'x');             // "xxxxx" — 5 copies of 'x'
string d = a;                 // copy
string e = std::move(a);      // move — a is now empty

// Concatenation
string s = "Hello" + string(", ") + "World";  // + needs at least one string
string t = s + '!';           // char appended
s += " suffix";               // in-place append (more efficient)
s.append(" more");            // same as +=
s.push_back('.');             // append single char

// Comparison — lexicographic, case-sensitive
s == t    s != t    s < t    s > t    s <= t    s >= t
s.compare(t)   // <0, 0, >0 — like strcmp

// Accessing characters
s[0]            // 'H' — unchecked
s.at(0)         // 'H' — throws std::out_of_range
s.front()       // first char
s.back()        // last char
s.data()        // const char* (C++17: also writable)
s.c_str()       // null-terminated const char* for C APIs`;

const c_search = `\
string s = "Hello, World!";

// ── Finding ──────────────────────────────────────────────────
s.find("World")         // 7  — index of first match
s.find("xyz")           // string::npos — not found
s.find('o')             // 4  — first 'o'
s.rfind('o')            // 8  — last 'o'
s.find("o", 5)          // 8  — search starting at index 5

// Always check for npos
auto pos = s.find("World");
if (pos != string::npos) {
  std::cout << "found at " << pos << "\\n";
}

// ── Contains / starts_with / ends_with (C++20) ───────────────
s.contains("World")     // true
s.starts_with("Hello")  // true
s.ends_with("!")         // true

// ── Pre-C++20 equivalents ────────────────────────────────────
s.find("World") != string::npos          // contains
s.rfind("Hello", 0) == 0                 // starts_with
s.size() >= 1 && s.back() == '!'        // ends_with`;

const c_modify = `\
string s = "Hello, World!";

// ── Substrings ───────────────────────────────────────────────
s.substr(7)        // "World!" — from index 7 to end
s.substr(7, 5)     // "World" — 5 chars starting at index 7

// ── Replace ──────────────────────────────────────────────────
s.replace(7, 5, "C++");   // "Hello, C++!" — replace 5 chars at index 7
s.replace(s.find("C++"), 3, "everyone");

// ── Insert / erase ───────────────────────────────────────────
s.insert(5, "!!!");       // insert "!!!" at index 5
s.erase(5, 3);            // erase 3 chars starting at index 5
s.erase(s.begin() + 5);   // erase single char via iterator

// ── Case conversion (no stdlib — use cctype) ─────────────────
#include <cctype>
#include <algorithm>
string lower = s;
std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
std::transform(lower.begin(), lower.end(), lower.begin(), ::toupper);

// ── Trim whitespace (no stdlib function — manual) ────────────
auto start = s.find_first_not_of(" \\t\\n\\r");
auto end   = s.find_last_not_of(" \\t\\n\\r");
string trimmed = (start == string::npos) ? "" : s.substr(start, end-start+1);`;

const c_conversion = `\
// ── String → number ──────────────────────────────────────────
int    i  = std::stoi("42");          // string to int
long   l  = std::stol("1234567890");
double d  = std::stod("3.14");
float  f  = std::stof("2.71f");

// stoi throws std::invalid_argument on bad input
// stoi throws std::out_of_range if value doesn't fit
try {
  int n = std::stoi("abc");   // throws invalid_argument
} catch (const std::exception& e) {
  std::cerr << e.what() << "\\n";
}

// stoi with position — stops at first non-digit
std::size_t pos;
int n = std::stoi("42px", &pos);   // n=42, pos=2 (chars consumed)

// ── Number → string ──────────────────────────────────────────
string s1 = std::to_string(42);        // "42"
string s2 = std::to_string(3.14159);   // "3.141590" (6 decimal places)

// Better formatting via ostringstream or std::format (C++20)
#include <sstream>
std::ostringstream oss;
oss << std::fixed << std::setprecision(2) << 3.14159;
string s3 = oss.str();   // "3.14"`;

const c_view = `\
#include <string_view>

// string_view — a non-owning read-only view into a string
// No heap allocation, no copy — just a pointer + length

void print(std::string_view sv) {   // accepts string, char*, literal
  std::cout << sv.size() << ": " << sv << "\\n";
}

print("hello");              // ✅ string literal — no copy
print(myString);             // ✅ std::string — no copy
print(myString.substr(2,3)); // ⚠ substr returns std::string (copy!)
print(std::string_view(myString).substr(2,3)); // ✅ no copy

// string_view supports most read-only string operations
std::string_view sv = "Hello, World!";
sv.substr(7, 5)    // "World" — still a view, no allocation
sv.find("World")   // 7
sv.starts_with("Hello")  // true (C++20)
sv[0]              // 'H'

// ⚠ Lifetime trap — string_view must not outlive its source
std::string_view bad() {
  std::string s = "hello";
  return s;   // ❌ s destroyed on return — dangling view!
}`;

const c_split = `\
// ── Split by delimiter (no stdlib function pre-C++23) ────────
#include <sstream>
std::vector<std::string> split(const std::string& s, char delim) {
  std::vector<std::string> parts;
  std::istringstream ss(s);
  std::string token;
  while (std::getline(ss, token, delim)) {
    parts.push_back(token);
  }
  return parts;
}
auto words = split("one,two,three", ',');  // {"one","two","three"}

// ── Join (no stdlib) ─────────────────────────────────────────
std::string join(const std::vector<std::string>& v, std::string_view sep) {
  std::string result;
  for (std::size_t i = 0; i < v.size(); i++) {
    if (i) result += sep;
    result += v[i];
  }
  return result;
}

// ── C++20: std::format ───────────────────────────────────────
#include <format>
std::string s = std::format("{:>10} | {:.2f}", "pi", 3.14159);
// "        pi | 3.14"

// ── Raw string literals ──────────────────────────────────────
std::string path = R"(C:\\Users\\Name\\file.txt)";   // no escaping
std::string json = R"({"key": "value\\n"})";`;

// ── Page component ──────────────────────────────────────────────────────────

export default function StringsPage() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">

        {/* 01 Overview */}
        <Card title="std::string Internals" num="01" color="orange" size="lg">
          <Prose>
            <H3>How std::string works</H3>
            <P>
              <Code>std::string</Code> owns a heap-allocated buffer of characters. Most implementations
              use <Code>Small String Optimization (SSO)</Code> — strings of 15 characters or fewer
              are stored directly inside the string object (on the stack), avoiding any heap allocation.
              Longer strings spill to the heap.
            </P>
            <Grid>
              <Cell>
                <H3>Key properties</H3>
                <OL>
                  <LI>Always null-terminated internally — <Code>c_str()</Code> is always safe to call for C APIs.</LI>
                  <LI>SSO threshold is typically 15 chars (GCC/Clang/MSVC) — short strings are essentially free.</LI>
                  <LI>Mutable — unlike Java/Python strings. Modify in-place with <Code>+=</Code>, <Code>replace</Code>, <Code>erase</Code>.</LI>
                  <LI>Copying is O(n) — prefer passing as <Code>const string&amp;</Code> or <Code>string_view</Code>.</LI>
                </OL>
              </Cell>
              <Cell>
                <H3>Choosing the right type</H3>
                <OL>
                  <LI><Code>std::string</Code> — own and modify a string. Pass by const-ref to avoid copies.</LI>
                  <LI><Code>std::string_view</Code> — read-only, non-owning view. Zero-cost parameter type for read-only access.</LI>
                  <LI><Code>const char*</Code> — C API interop only. Use <Code>s.c_str()</Code> to get one from a string.</LI>
                  <LI><Code>char[]</Code> — avoid in new code. Use string or string_view instead.</LI>
                </OL>
                <Note>Prefer string_view over const string& for function parameters — it accepts literals and substrings without allocating.</Note>
              </Cell>
            </Grid>
          </Prose>
        </Card>

        {/* 02 Construction & Access */}
        <Card title="Construction, Concatenation & Access" num="02" color="orange" size="md">
          <CodeBlock code={c_construction} />
          <InfoTable rows={[
            { key: 'string(n, c)',    value: "Repeat character c exactly n times. Useful for padding and separators." },
            { key: "s += t",          value: "Appends in-place — more efficient than s = s + t which creates a temporary." },
            { key: "s.c_str()",       value: "Returns a null-terminated const char*. Valid until the string is modified or destroyed." },
            { key: "s.data()",        value: "C++17: returns a writable char*. Pre-C++17: same as c_str() (const)." },
          ]} />
        </Card>

        {/* 03 Searching */}
        <Card title="Searching" num="03" color="orange" size="md">
          <CodeBlock code={c_search} />
          <InfoTable rows={[
            { key: "find(str, pos)",   value: "Returns index of first match at or after pos. Returns string::npos if not found — always check!" },
            { key: "rfind(str)",       value: "Searches from the end — returns index of last match." },
            { key: "string::npos",     value: "A large sentinel value (size_t max). Comparing an index to npos is the standard not-found check." },
            { key: "contains (C++20)", value: "Returns bool — cleaner than find() != npos for simple existence checks." },
          ]} />
          <Tip color="orange">
            <strong>Always check for <code>string::npos</code>.</strong> Passing <code>find()</code>&apos;s return directly as an index without checking will cause undefined behavior when the substring isn&apos;t found.
          </Tip>
        </Card>

        {/* 04 Modifying */}
        <Card title="Modifying Strings" num="04" color="orange" size="md">
          <CodeBlock code={c_modify} />
          <InfoTable rows={[
            { key: "substr(pos, n)",     value: "Returns a NEW string — always allocates. Use string_view::substr for a zero-copy slice." },
            { key: "replace(pos, n, s)", value: "Replaces n chars at pos with s. s can be longer or shorter." },
            { key: "tolower/toupper",    value: "From <cctype> — operates on single chars. Use std::transform to apply to the whole string." },
            { key: "find_first_not_of",  value: "Find first character NOT in the given set — use for trimming whitespace." },
          ]} />
        </Card>

        {/* 05 Conversions */}
        <Card title="String ↔ Number Conversions" num="05" color="orange" size="md">
          <CodeBlock code={c_conversion} />
          <InfoTable rows={[
            { key: "stoi / stol / stoll",  value: "String to int/long/long long. Throws on invalid input or overflow." },
            { key: "stof / stod / stold",  value: "String to float/double/long double." },
            { key: "to_string(n)",         value: "Number to string. For floats: always 6 decimal places — use ostringstream for control." },
            { key: "stoi pos argument",    value: "Optional pointer to size_t — set to number of characters consumed. Use to detect trailing non-numeric chars." },
          ]} />
        </Card>

        {/* 06 string_view */}
        <Card title="std::string_view (C++17)" num="06" color="orange" size="md">
          <CodeBlock code={c_view} />
          <InfoTable rows={[
            { key: "non-owning",     value: "Just a pointer + length. No allocation, no copy. Read-only." },
            { key: "accepts all",    value: "A string_view parameter accepts std::string, const char*, and string literals without conversion." },
            { key: "lifetime",       value: "The view is only valid while the underlying string exists. Never store a view to a temporary." },
            { key: "no c_str()",     value: "string_view is NOT null-terminated. Cannot pass directly to C APIs — convert to string first." },
          ]} />
          <Tip color="orange">
            <strong>Use string_view for all read-only string parameters.</strong> It&apos;s strictly better than <code>const string&amp;</code> — it accepts literals without heap allocation and substrings without copying.
          </Tip>
        </Card>

        {/* 07 Split, Join, Format */}
        <Card title="Split · Join · Format · Raw Literals" num="07" color="orange" size="md">
          <CodeBlock code={c_split} />
          <InfoTable rows={[
            { key: "istringstream",    value: "Use getline with a delimiter to split a string into tokens." },
            { key: "std::format C++20", value: "Python-style {} placeholders with format specs. Type-safe. Prefer over printf and ostringstream." },
            { key: 'R"(...)"',         value: "Raw string literal — backslashes are literal. Use for regex patterns, Windows paths, JSON." },
          ]} />
        </Card>

      </div>
    </>
  );
}

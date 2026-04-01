import type { ComponentType } from "react";
import ProgramStructure from "./program-structure";
import DataTypes from "./data-types";
import VariablesConstants from "./variables-constants";
import InputOutput from "./input-output";
import Operators from "./operators";
import IfElse from "./if-else";
import Switch from "./switch";
import Loops from "./loops";
import Functions from "./functions";
import Arrays from "./arrays";
import Vectors from "./vectors";
import Strings from "./strings";
import PointersReferences from "./pointers-references";
import Structs from "./structs";
import Classes from "./classes";
import Algorithms from "./algorithms";
import Math from "./math";
import CommonMistakes from "./common-mistakes";
import CompileRun from "./compile-run";
import DynamicMemory from "./dynamic-memory";

export interface TopicMeta {
  title: string;
  num: string;
  subtitle: string;
  color: "cyan" | "orange" | "purple" | "green" | "red" | "yellow";
  component: ComponentType;
}

export const topics: Record<string, TopicMeta> = {
  "program-structure": {
    title: "Program Structure",
    num: "01",
    subtitle: "Translation Units · Linkage · ODR · C++17",
    color: "cyan",
    component: ProgramStructure,
  },
  "data-types": {
    title: "Data Types",
    num: "02",
    subtitle: "Integers · Floats · Chars · auto · Conversions · Type Traits",
    color: "orange",
    component: DataTypes,
  },
  "variables-constants": {
    title: "Variables & Constants",
    num: "03",
    subtitle: "Storage Duration · Initialization · Scope · const · constexpr · volatile",
    color: "purple",
    component: VariablesConstants,
  },
  "input-output": {
    title: "Input / Output",
    num: "04",
    subtitle: "Streams · Formatting · cin · File I/O · sstream · std::format",
    color: "green",
    component: InputOutput,
  },
  "operators": {
    title: "Operators",
    num: "05",
    subtitle: "Precedence · Arithmetic · Bitwise · Comparison · Overloading",
    color: "yellow",
    component: Operators,
  },
  "if-else": {
    title: "If / Else",
    num: "06",
    subtitle: "Initializer if · if constexpr · Short-Circuit · Ternary · std::optional",
    color: "cyan",
    component: IfElse,
  },
  "switch": {
    title: "Switch Statement",
    num: "07",
    subtitle: "Fall-Through · [[fallthrough]] · enum class · Initializer · Dispatch Patterns",
    color: "orange",
    component: Switch,
  },
  "loops": {
    title: "Loops",
    num: "08",
    subtitle: "for · while · Range-for · break/continue · Algorithms · Performance",
    color: "purple",
    component: Loops,
  },
  "functions": {
    title: "Functions",
    num: "09",
    subtitle: "Passing · Overloading · Defaults · Lambdas · std::function · RVO",
    color: "green",
    component: Functions,
  },
  "arrays": {
    title: "Arrays",
    num: "10",
    subtitle: "Decay · std::array · 2D Arrays · Pointer Arithmetic · C array vs vector",
    color: "red",
    component: Arrays,
  },
  "vectors": {
    title: "Vector (Dynamic Array)",
    num: "11",
    subtitle: "Internals · Capacity · Iterators · Algorithms · Move Semantics · emplace",
    color: "cyan",
    component: Vectors,
  },
  "strings": {
    title: "Strings",
    num: "12",
    subtitle: "SSO · Searching · Modifying · Conversions · string_view · std::format",
    color: "orange",
    component: Strings,
  },
  "pointers-references": {
    title: "Pointers & References",
    num: "13",
    subtitle: "Raw Pointers · References · Smart Pointers · Ownership · this · UB",
    color: "purple",
    component: PointersReferences,
  },
  "structs": {
    title: "Structs",
    num: "14",
    subtitle: "Aggregates · Memory Layout · Padding · Special Members · POD · struct vs class",
    color: "green",
    component: Structs,
  },
  "classes": {
    title: "Classes (OOP Basics)",
    num: "15",
    subtitle: "Encapsulation · Constructors · RAII · Inheritance · Virtual · Access Control",
    color: "cyan",
    component: Classes,
  },
  "algorithms": {
    title: "Useful Algorithms",
    num: "16",
    subtitle: "Sorting · Searching · Transform · Numeric · Reordering · C++20 Ranges",
    color: "orange",
    component: Algorithms,
  },
  "math": {
    title: "Math Functions",
    num: "17",
    subtitle: "cmath · Trig · Logarithms · Random · Numeric Limits · C++20 Constants",
    color: "yellow",
    component: Math,
  },
  "common-mistakes": {
    title: "Common Beginner Mistakes",
    num: "18",
    subtitle: "UB · Initialization · Memory · Type System · STL · Diagnostic Tools",
    color: "red",
    component: CommonMistakes,
  },
  "compile-run": {
    title: "Compile & Run",
    num: "19",
    subtitle: "Pipeline · Flags · Sanitizers · CMake · Debugging · Makefiles",
    color: "green",
    component: CompileRun,
  },
  "dynamic-memory": {
    title: "Dynamic Memory",
    num: "20",
    subtitle: "new/delete · unique_ptr · shared_ptr · weak_ptr · Ownership · Pools",
    color: "purple",
    component: DynamicMemory,
  },
};

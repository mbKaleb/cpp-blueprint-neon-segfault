import type { ComponentType } from "react";
import ProgramStructure from "./program-structure";
import DataTypes from "./data-types";

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
};

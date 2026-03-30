import type { ComponentType } from "react";
import ProgramStructure from "./program-structure";

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
};

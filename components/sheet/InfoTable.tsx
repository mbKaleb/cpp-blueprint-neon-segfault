import React from "react";

interface Row {
  key: string;
  value: React.ReactNode;
}

interface InfoTableProps {
  rows: Row[];
}

export default function InfoTable({ rows }: InfoTableProps) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border last:border-b-0">
            <td className="px-3.5 py-2 font-mono text-[11.5px] text-accent whitespace-nowrap w-[38%] align-top">
              {row.key}
            </td>
            <td className="px-3.5 py-2 text-muted text-[12px] align-top">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

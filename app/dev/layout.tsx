import { notFound } from "next/navigation";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.DEV_TOOLS !== "true") notFound();
  return <>{children}</>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { topics } from "@/lib/topics/registry";

export default async function TopicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topics[slug];

  if (!topic) notFound();

  return (
    <>
      <Link
        href="/"
        className="absolute top-6 left-12 h-[34px] inline-flex items-center gap-2 font-mono text-[11px] tracking-[3px] uppercase text-muted hover:text-accent transition-colors"
      >
        ← Back to Quick Reference
      </Link>

      <PageHeader
        label={`Topic ${topic.num}`}
        title={topic.title}
        subtitle={topic.subtitle}
        badge="C++17 · Advanced Reference"
      />

      {children}
    </>
  );
}

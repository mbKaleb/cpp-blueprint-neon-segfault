import { notFound } from "next/navigation";
import { topics } from "@/lib/topics/registry";

export async function generateStaticParams() {
  return Object.keys(topics).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topics[slug];
  if (!topic) return {};
  return {
    title: `${topic.title} — C++ Cheat Sheet`,
    description: topic.subtitle,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topics[slug];

  if (!topic) notFound();

  const Content = topic.component;
  return <Content />;
}

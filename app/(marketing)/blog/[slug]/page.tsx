// app/(marketing)/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ARTICLES } from "@/lib/blog/articles";
import ArticleView from "@/components/blog/ArticleView";

interface PageProps {
  params: { slug: string };
}

// SEO metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = ARTICLES.find((a) => a.slug === params.slug);

  if (!article) {
    return { title: "Article Not Found | Confide Blog" };
  }

  return {
    title: `${article.title} | Confide Blog`,
    description: article.subtitle,
    keywords: article.tags.join(", "),
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      siteName: "Confide",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle,
    },
  };
}

// Pre-generate all article pages at build time
export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default function BlogArticlePage({ params }: PageProps) {
  const article = ARTICLES.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return <ArticleView article={article} />;
}

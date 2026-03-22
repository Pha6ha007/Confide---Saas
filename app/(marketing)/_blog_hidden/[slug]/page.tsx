// app/(marketing)/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ARTICLES } from "@/lib/blog/articles";
import ArticleView from "@/components/blog/ArticleView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SEO metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

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

// Helper function to convert date string to ISO format
function convertDateToISO(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.subtitle,
    datePublished: convertDateToISO(article.date),
    author: {
      "@type": "Organization",
      name: "Confide",
    },
    publisher: {
      "@type": "Organization",
      name: "Confide",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleView article={article} />
    </>
  );
}

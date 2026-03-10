// app/(marketing)/blog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ARTICLES } from "@/lib/blog/articles";
import AnimatedTagCloud from "@/components/blog/AnimatedTagCloud";
import ArticleCard from "@/components/blog/ArticleCard";
import type { Article } from "@/lib/blog/articles";

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? ARTICLES.filter((a) => a.tags.includes(activeTag))
    : ARTICLES;

  const handleArticleClick = (article: Article) => {
    window.location.href = `/blog/${article.slug}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg,#EEF2FF 0%,var(--background, #FAFAF9) 40%,#FEF9EE 100%)",
          }}
        />
        {/* Floating dots */}
        <div
          className="absolute top-16 right-20 w-3 h-3 rounded-full"
          style={{ background: "#6366F1", opacity: 0.15 }}
        />
        <div
          className="absolute top-32 right-40 w-2 h-2 rounded-full"
          style={{ background: "#F59E0B", opacity: 0.2 }}
        />

        <div className="relative max-w-5xl mx-auto px-5 pt-16 md:pt-24 pb-12 md:pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-10 text-muted-foreground">
            <Link href="/" className="font-semibold text-primary hover:underline">
              Confide
            </Link>
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Blog</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-5 text-foreground">
            Thoughts on{" "}
            <span className="relative inline-block text-primary">
              healing
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                style={{ opacity: 0.3 }}
              >
                <path
                  d="M2 8c40-6 80-6 120-2s56 2 76-2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-muted-foreground">
            Evidence-based psychology, no fluff. Articles backed by research
            that help you understand yourself — and what you can actually do
            about it.
          </p>
        </div>
      </header>

      {/* Tag Cloud */}
      <section className="max-w-4xl mx-auto px-5 py-8 md:py-10">
        <div className="rounded-2xl p-6 md:p-8 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
            >
              <path
                d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="7" r="1" fill="currentColor" />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Explore topics
            </span>
            <span className="text-xs ml-1 text-muted-foreground">
              — hover to explore
            </span>
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="ml-auto text-xs px-3 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                Clear ✕
              </button>
            )}
          </div>
          <AnimatedTagCloud onTagClick={setActiveTag} activeTag={activeTag} />
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        {activeTag && (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing articles tagged with{" "}
            <span className="font-semibold text-primary">
              &ldquo;{activeTag}&rdquo;
            </span>{" "}
            · {filtered.length}{" "}
            {filtered.length === 1 ? "article" : "articles"}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} onClick={handleArticleClick} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-4">🔍</span>
            <p className="text-lg text-muted-foreground">
              No articles match this topic yet.
            </p>
            <button
              onClick={() => setActiveTag(null)}
              className="mt-4 text-sm font-medium px-5 py-2 rounded-lg text-primary bg-primary/5"
            >
              Show all articles
            </button>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg,#312E81 0%,#4338CA 50%,#6366F1 100%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4">
            Reading is a start.{" "}
            <span style={{ color: "#FBBF24" }}>
              Talking is the next step.
            </span>
          </h2>
          <p
            className="text-base md:text-lg mb-8"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Alex remembers every conversation, understands your patterns, and is
            available 24/7. Start with 5 free sessions — no credit card, no
            commitment.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 bg-white text-indigo-700"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          >
            Start Your Journey — Free
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

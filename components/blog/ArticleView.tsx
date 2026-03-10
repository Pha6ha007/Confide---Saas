// components/blog/ArticleView.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Article, ContentBlock } from "@/lib/blog/articles";

interface ArticleViewProps {
  article: Article;
}

function renderBlock(block: ContentBlock, i: number, articleColor: string) {
  switch (block.type) {
    case "intro":
      return (
        <p
          key={i}
          className="font-serif text-lg md:text-xl leading-relaxed mb-8 text-foreground/80"
        >
          {block.text}
        </p>
      );

    case "stat-banner":
      return (
        <div
          key={i}
          className="my-8 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4"
          style={{
            background: `linear-gradient(135deg,${articleColor}08,${articleColor}04)`,
            borderLeft: `4px solid ${articleColor}`,
          }}
        >
          <span
            className="font-serif text-4xl md:text-5xl font-bold shrink-0"
            style={{ color: articleColor }}
          >
            {block.stat}
          </span>
          <div>
            <p className="text-base leading-relaxed text-foreground/80">
              {block.label}
            </p>
            <p className="text-xs mt-1.5 font-medium text-muted-foreground">
              Source: {block.source}
            </p>
          </div>
        </div>
      );

    case "heading":
      return (
        <h2
          key={i}
          className="font-serif text-2xl font-semibold mt-10 mb-4 text-foreground"
        >
          {block.text}
        </h2>
      );

    case "paragraph":
      return (
        <p
          key={i}
          className="text-base md:text-lg leading-relaxed mb-5 text-foreground/70"
        >
          {block.text}
        </p>
      );

    case "table":
      return (
        <div
          key={i}
          className="my-8 overflow-hidden rounded-xl border border-border"
        >
          <div className="px-5 py-3" style={{ background: `${articleColor}06` }}>
            <h4 className="text-sm font-semibold" style={{ color: articleColor }}>
              📊 {block.title}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  {block.headers?.map((h, hi) => (
                    <th
                      key={hi}
                      className="px-4 py-3 text-left font-semibold text-foreground/80 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows?.map((row, ri) => (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white" : "bg-muted/20"}
                    style={{
                      borderBottom:
                        ri < (block.rows?.length || 0) - 1
                          ? "1px solid var(--border, #F3F4F6)"
                          : "none",
                    }}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3 ${
                          ci === 0
                            ? "font-medium text-foreground"
                            : "text-foreground/70"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 bg-muted/50 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Source: {block.source}
            </p>
          </div>
        </div>
      );

    case "sources":
      return (
        <div
          key={i}
          className="my-10 p-6 rounded-xl bg-muted/50 border border-border"
        >
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 text-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M4 19.5A2.5 2.5 0 016.5 17H20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            References & Further Reading
          </h4>
          <ol className="space-y-2.5">
            {block.items?.map((src, si) => (
              <li
                key={si}
                className="text-sm leading-relaxed flex gap-2 text-muted-foreground"
              >
                <span className="shrink-0 text-xs font-semibold mt-0.5 text-muted-foreground/60">
                  [{si + 1}]
                </span>
                <span>{src}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "cta":
      return (
        <div
          key={i}
          className="mt-12 p-8 rounded-2xl text-center"
          style={{
            background:
              "linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 50%,#FEF3C7 100%)",
          }}
        >
          <p className="text-base leading-relaxed mb-5 text-foreground/80">
            {block.text}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg,${articleColor} 0%,${articleColor}cc 100%)`,
            }}
          >
            Talk to Alex
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      );

    default:
      return null;
  }
}

export default function ArticleView({ article }: ArticleViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [article]);

  return (
    <div className="min-h-screen bg-background">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-5 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:gap-3 text-primary bg-primary/5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to articles
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-5 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: `${article.color}10`, color: article.color }}
          >
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{article.date}</span>
          <span className="text-xs text-muted-foreground">
            · {article.readTime}
          </span>
        </div>

        <span className="text-5xl block mb-5">{article.heroEmoji}</span>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4 text-foreground">
          {article.title}
        </h1>

        <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
          {article.subtitle}
        </p>

        <div
          className="mt-8 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,var(--border, #E5E7EB),transparent)",
          }}
        />
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-5 pb-20">
        {article.content.map((block, i) =>
          renderBlock(block, i, article.color)
        )}

        {/* Tags */}
        <div className="mt-12 pt-6 border-t border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Topics
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-sm bg-primary/5 text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

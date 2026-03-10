// components/blog/ArticleCard.tsx
"use client";

import { useState } from "react";
import type { Article } from "@/lib/blog/articles";

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  const [h, setH] = useState(false);

  return (
    <button
      onClick={() => onClick(article)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="group block w-full text-left bg-white rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4"
      style={{
        boxShadow: h
          ? `0 8px 30px ${article.color}18, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        transform: h ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          background: `linear-gradient(90deg,${article.color},${article.color}88)`,
          height: h ? 3 : 2,
          transition: "height 0.3s ease",
        }}
      />
      <div className="p-7 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: `${article.color}10`, color: article.color }}
          >
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{article.readTime}</span>
        </div>
        <div className="flex items-start gap-4">
          <span
            className="text-3xl mt-0.5 shrink-0"
            style={{
              transform: h ? "scale(1.2) rotate(-5deg)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              display: "inline-block",
            }}
          >
            {article.heroEmoji}
          </span>
          <div className="min-w-0">
            <h3
              className="font-serif text-xl md:text-2xl font-semibold leading-snug mb-2"
              style={{
                color: h ? article.color : "var(--foreground, #1F2937)",
                transition: "color 0.3s ease",
              }}
            >
              {article.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {article.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-5">
          {article.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <div
          className="mt-5 flex items-center text-sm font-medium"
          style={{
            color: article.color,
            gap: h ? 10 : 6,
            transition: "gap 0.3s ease",
          }}
        >
          Read article
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: h ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

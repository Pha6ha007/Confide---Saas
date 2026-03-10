// components/blog/AnimatedTagCloud.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { ALL_TAGS, TAG_COLORS } from "@/lib/blog/tags";

const SHUFFLED = [...ALL_TAGS].sort(() => 0.5 - Math.random());

interface AnimatedTagCloudProps {
  onTagClick: (tag: string | null) => void;
  activeTag: string | null;
}

export default function AnimatedTagCloud({ onTagClick, activeTag }: AnimatedTagCloudProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex flex-wrap items-center justify-center gap-1 py-3"
      onMouseMove={onMove}
      style={{ minHeight: 120 }}
    >
      {SHUFFLED.map((tag, i) => {
        const isActive = activeTag === tag.text;
        const isHov = hovered === tag.text;
        const c = TAG_COLORS[i % TAG_COLORS.length];

        return (
          <button
            key={tag.text}
            onClick={() => onTagClick(isActive ? null : tag.text)}
            onMouseEnter={() => setHovered(tag.text)}
            onMouseLeave={() => setHovered(null)}
            className="relative cursor-pointer select-none"
            style={{
              fontSize: `${tag.size * 0.72}rem`,
              fontWeight: isHov || isActive ? 700 : tag.size > 1.7 ? 600 : tag.size > 1.4 ? 500 : 400,
              color: isActive ? c : isHov ? c : `rgba(31,41,55,${0.35 + (tag.size - 1.15) * 0.45})`,
              padding: "5px 14px",
              borderRadius: "9999px",
              lineHeight: 1.7,
              background: isActive ? `${c}10` : isHov ? `${c}08` : "transparent",
              border: isActive ? `1.5px solid ${c}40` : "1.5px solid transparent",
              transform: isHov
                ? `scale(1.22) translateY(-3px) rotate(${i % 2 === 0 ? 2 : -2}deg)`
                : isActive
                ? "scale(1.08)"
                : "scale(1)",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              textShadow: isHov ? `0 0 20px ${c}40, 0 0 40px ${c}15` : "none",
              zIndex: isHov ? 10 : 1,
              letterSpacing: isHov ? "0.03em" : "0",
            }}
          >
            {/* Animated dot */}
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 6,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: c,
                opacity: isHov ? 1 : 0,
                transform: isHov ? "scale(1)" : "scale(0)",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
            {tag.text}
            {/* Tooltip */}
            <span
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: "50%",
                transform: `translateX(-50%) ${isHov ? "translateY(0) scale(1)" : "translateY(4px) scale(0.9)"}`,
                opacity: isHov ? 1 : 0,
                background: "#1F2937",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                zIndex: 20,
              }}
            >
              {tag.count} articles
              <span
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 6,
                  height: 6,
                  background: "#1F2937",
                }}
              />
            </span>
          </button>
        );
      })}
      {/* Cursor glow */}
      <div
        style={{
          position: "absolute",
          left: mousePos.x - 80,
          top: mousePos.y - 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "left 0.15s ease-out, top 0.15s ease-out",
          zIndex: 0,
        }}
      />
    </div>
  );
}

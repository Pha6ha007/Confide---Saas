// lib/blog/tags.ts

export interface BlogTag {
  text: string;
  size: number;
  count: number;
}

export const ALL_TAGS: BlogTag[] = [
  { text: "anxiety", size: 2.2, count: 47 },
  { text: "relationships", size: 1.9, count: 38 },
  { text: "self-awareness", size: 1.6, count: 31 },
  { text: "trauma", size: 1.85, count: 36 },
  { text: "CBT", size: 1.5, count: 28 },
  { text: "panic attacks", size: 1.7, count: 33 },
  { text: "depression", size: 1.95, count: 39 },
  { text: "boundaries", size: 1.4, count: 24 },
  { text: "healing", size: 1.75, count: 34 },
  { text: "men's health", size: 1.3, count: 21 },
  { text: "self-worth", size: 1.55, count: 29 },
  { text: "attachment theory", size: 1.45, count: 26 },
  { text: "coping strategies", size: 1.6, count: 30 },
  { text: "inner child", size: 1.35, count: 22 },
  { text: "vulnerability", size: 1.25, count: 19 },
  { text: "nervous system", size: 1.5, count: 27 },
  { text: "emotional intelligence", size: 1.4, count: 25 },
  { text: "toxic patterns", size: 1.3, count: 20 },
  { text: "breathing", size: 1.65, count: 32 },
  { text: "mental health", size: 2.0, count: 41 },
  { text: "PTSD", size: 1.2, count: 18 },
  { text: "grounding", size: 1.35, count: 23 },
  { text: "stigma", size: 1.15, count: 16 },
  { text: "childhood", size: 1.45, count: 26 },
  { text: "self-care", size: 1.55, count: 29 },
];

export const TAG_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#059669",
  "#7C3AED", "#DC2626", "#0891B2", "#D946EF", "#2563EB",
];

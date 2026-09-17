import raw from "../data/articles.json";

export interface Article {
  title: string;
  url: string;
  date: string;
  tags: string[];
  excerpt: string;
  stem_reason: string;
  summary: string;
  image_url: string | null;
}

export const articles: Article[] = [...(raw as Article[])].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export function slugFor(article: Article): string {
  const segments = article.url.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

export function articleBySlug(slug: string): Article | undefined {
  return articles.find((a) => slugFor(a) === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface DateGroup {
  date: string; // YYYY-MM-DD
  articles: Article[];
}

// The scraped dates always carry a +08:00 offset, so the first 10 characters
// are already the correct Sarawak-local calendar day -- no timezone math
// needed (and none that could disagree with the viewer's own timezone).
export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function groupByDate(list: Article[] = articles): DateGroup[] {
  const map = new Map<string, Article[]>();
  for (const a of list) {
    const key = dateKey(a.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return [...map.entries()]
    .map(([date, arts]) => ({ date, articles: arts }))
    .sort((a, b) => a.date.localeCompare(b.date)); // ascending: oldest first
}

export function formatDayLabel(key: string): string {
  return new Date(`${key}T00:00:00+08:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
  });
}

export function formatFullDate(key: string): string {
  return new Date(`${key}T00:00:00+08:00`).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

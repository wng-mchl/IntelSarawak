// Client-side filter state shared by the category cards, the activity
// calendar and the article list on the home page. Each Astro <script> is its
// own module entry, but they all import this file, so they share one instance.

export interface ArticleStub {
  slug: string;
  title: string;
  date: string;
  summary: string;
  image_url: string | null;
  category: string;
  featured: boolean;
}

export interface Filter {
  category: string | null;
  date: string | null; // YYYY-MM-DD, Sarawak-local
}

export const ARTICLES_DATA_ID = "articles-data";

export function loadArticles(): ArticleStub[] {
  const el = document.getElementById(ARTICLES_DATA_ID);
  return JSON.parse(el?.textContent ?? "[]");
}

let state: Filter = { category: null, date: null };
const subscribers = new Set<(f: Filter) => void>();

export function getFilter(): Filter {
  return state;
}

export function setFilter(patch: Partial<Filter>): void {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => fn(state));
}

export function subscribe(fn: (f: Filter) => void): void {
  subscribers.add(fn);
  fn(state);
}

// Scraped dates carry a +08:00 offset, so the first 10 characters are
// already the Sarawak-local calendar day.
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

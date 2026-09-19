// Category metadata shared by server (.astro) and client scripts. Tailwind
// only generates classes it can see as complete strings, so every class name
// below is written out in full rather than built dynamically.

export const CATEGORY_ORDER = [
  "school_competition",
  "school_event",
  "school_results",
  "university",
  "news",
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

interface CategoryMeta {
  label: string;
  badge: string;
  dot: string;
  bar: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  school_competition: {
    label: "School competitions",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
    bar: "bg-amber-400 dark:bg-amber-500",
  },
  school_event: {
    label: "School events",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    dot: "bg-violet-500",
    bar: "bg-violet-400 dark:bg-violet-500",
  },
  school_results: {
    label: "School results",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    dot: "bg-rose-500",
    bar: "bg-rose-400 dark:bg-rose-500",
  },
  university: {
    label: "University",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
    bar: "bg-sky-400 dark:bg-sky-500",
  },
  news: {
    label: "STEM news",
    badge: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-500",
    bar: "bg-slate-400 dark:bg-slate-500",
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category as Category] ?? CATEGORY_META.news;
}

// Shared client-side DOM builders used by both timeline views to render a
// day's articles as full cards -- kept in one place so the "day" content
// panel looks and behaves identically wherever it's used.

export interface ArticleStub {
  slug: string;
  title: string;
  summary: string;
  image_url: string | null;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

export function articleCard(a: ArticleStub): HTMLElement {
  const thumb = a.image_url
    ? el("img", {
        src: a.image_url,
        alt: "",
        loading: "lazy",
        referrerpolicy: "no-referrer",
        class: "aspect-[3/2] w-full object-cover",
      })
    : el("div", {
        class: "aspect-[3/2] w-full bg-gradient-to-br from-brand-50 to-slate-100 dark:from-slate-900 dark:to-black",
      });

  return el(
    "div",
    {
      class:
        "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-black dark:hover:border-brand-800",
    },
    thumb,
    el(
      "div",
      { class: "flex flex-1 flex-col p-6" },
      el("h3", { class: "font-display text-xl leading-snug font-semibold text-slate-900 dark:text-slate-100" }, a.title),
      el("p", { class: "mt-3 line-clamp-3 flex-1 text-base text-slate-600 dark:text-slate-400" }, a.summary),
      el(
        "a",
        {
          href: `/articles/${a.slug}/`,
          class:
            "mt-5 inline-flex w-fit items-center gap-1 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:text-black dark:hover:bg-brand-400",
        },
        "View article",
      ),
    ),
  );
}

export function renderDayCardsGrid(articlesForDay: ArticleStub[]): HTMLElement {
  const grid = el("div", { class: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" });
  for (const a of articlesForDay) grid.append(articleCard(a));
  return grid;
}

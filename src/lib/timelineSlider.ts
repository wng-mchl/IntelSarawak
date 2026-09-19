// A custom-styled scrubber for the timeline views: press the thumb (or anywhere
// on the rail) and drag left/right. It reports a 0..1 fraction; each view
// decides what that means (scroll the coverflow, pick a day, ...).
//
// Styling is all Tailwind utility strings so the classes are picked up by the
// build. `data-dragging` on the root drives the "held" look via group-data-*.

import { el } from "./domCardBuilder";

interface Options {
  steps: number;
  label: (index: number) => string;
  // `dragging` is true while the pointer is held and false for the final
  // snap-to-nearest-step call (mouse release, or a key press).
  onChange: (fraction: number, dragging: boolean) => void;
}

export interface TimelineSlider {
  // Move the thumb from outside (e.g. the timeline was scrolled). Ignored
  // while the user is dragging so the two never fight over the position.
  setFraction: (fraction: number) => void;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function createTimelineSlider(mount: HTMLElement, { steps, label, onChange }: Options): TimelineSlider | null {
  if (steps < 2) return null;
  const last = steps - 1;
  const indexOf = (f: number) => Math.round(f * last);

  const fill = el("div", {
    class:
      "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-300 to-brand-600 transition-[width] duration-200 ease-out group-data-[dragging=true]:duration-0 dark:from-brand-800 dark:to-brand-400",
  });

  const ticks = Array.from({ length: steps }, (_, i) =>
    el("span", {
      class: "absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 dark:bg-black/40",
      style: `left: ${(i / last) * 100}%`,
    }),
  );

  const bubbleText = el("span", {
    class:
      "block rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-md dark:bg-slate-100 dark:text-slate-900",
  });
  const bubble = el(
    "div",
    {
      class:
        "pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 transition-transform duration-150 group-data-[dragging=true]:-translate-y-1",
    },
    bubbleText,
    el("span", { class: "absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900 dark:bg-slate-100" }),
  );

  const grip = el(
    "div",
    {
      class:
        "flex h-8 w-6 items-center justify-center gap-0.5 rounded-full border-4 border-white bg-brand-600 shadow-lg ring-1 ring-slate-300 transition-transform duration-150 group-hover:scale-105 group-data-[dragging=true]:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-brand-400 dark:border-black dark:bg-brand-400 dark:ring-slate-700",
    },
    el("span", { class: "h-3 w-px rounded bg-white/80 dark:bg-black/60" }),
    el("span", { class: "h-3 w-px rounded bg-white/80 dark:bg-black/60" }),
  );

  const thumb = el(
    "div",
    {
      class:
        "absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-200 ease-out group-data-[dragging=true]:duration-0",
    },
    bubble,
    grip,
  );

  const lane = el(
    "div",
    { class: "relative h-2 rounded-full bg-slate-200 dark:bg-slate-800" },
    fill,
    ...ticks,
    thumb,
  );

  const root = el(
    "div",
    {
      class:
        "group relative mx-auto w-full max-w-3xl cursor-grab touch-none px-2 pt-16 pb-6 outline-none select-none data-[dragging=true]:cursor-grabbing",
      tabindex: "0",
      role: "slider",
      "aria-label": "Scrub through days",
      "aria-orientation": "horizontal",
      "aria-valuemin": "0",
      "aria-valuemax": String(last),
    },
    el(
      "div",
      { class: "mx-6" },
      lane,
      el(
        "div",
        { class: "mt-5 flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500" },
        el("span", {}, label(0)),
        el("span", {}, label(last)),
      ),
    ),
  );
  mount.replaceChildren(root);

  let fraction = 1;
  let shown = -1;
  let dragging = false;

  function render() {
    const pct = `${fraction * 100}%`;
    thumb.style.left = pct;
    fill.style.width = pct;
    const i = indexOf(fraction);
    if (i !== shown) {
      shown = i;
      bubbleText.textContent = label(i);
      root.setAttribute("aria-valuenow", String(i));
      root.setAttribute("aria-valuetext", label(i));
    }
  }

  const fractionAt = (clientX: number) => {
    const r = lane.getBoundingClientRect();
    return r.width ? clamp((clientX - r.left) / r.width) : fraction;
  };

  function finish() {
    if (!dragging) return;
    dragging = false;
    delete root.dataset.dragging;
    fraction = indexOf(fraction) / last; // snap to the nearest day
    render();
    onChange(fraction, false);
  }

  root.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    root.dataset.dragging = "true";
    root.setPointerCapture(e.pointerId);
    root.focus({ preventScroll: true });
    fraction = fractionAt(e.clientX);
    render();
    onChange(fraction, true);
  });
  root.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    fraction = fractionAt(e.clientX);
    render();
    onChange(fraction, true);
  });
  root.addEventListener("pointerup", finish);
  root.addEventListener("pointercancel", finish);

  root.addEventListener("keydown", (e) => {
    const stepBy: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 };
    let next: number | null = null;
    if (e.key in stepBy) next = indexOf(fraction) + stepBy[e.key];
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    fraction = Math.min(last, Math.max(0, next)) / last;
    render();
    onChange(fraction, false);
  });

  render();

  return {
    setFraction(f: number) {
      if (dragging) return;
      fraction = clamp(f);
      render();
    },
  };
}

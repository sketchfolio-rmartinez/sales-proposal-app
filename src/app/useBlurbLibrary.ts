import { useMemo, useState } from "react";
import { blurbLibrary as defaultBlurbs } from "../data/defaults";
import { BlurbCategory, BlurbLibraryItem } from "../types";

const BLURB_STORAGE_KEY = "sales-proposal-app:blurbs:v1";

function normalizeBlurbs(items: unknown): BlurbLibraryItem[] {
  if (!Array.isArray(items)) return defaultBlurbs;

  return items
    .filter((item): item is Partial<BlurbLibraryItem> => Boolean(item))
    .map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      title: item.title ?? "Untitled Blurb",
      category: item.category ?? "General RFP",
      tags: item.tags ?? [],
      contentPlaintext: item.contentPlaintext ?? "",
      isActive: item.isActive ?? true,
    }));
}

function loadBlurbs(): BlurbLibraryItem[] {
  const raw = localStorage.getItem(BLURB_STORAGE_KEY);
  if (!raw) return defaultBlurbs;

  try {
    return normalizeBlurbs(JSON.parse(raw));
  } catch {
    return defaultBlurbs;
  }
}

function saveBlurbs(items: BlurbLibraryItem[]) {
  localStorage.setItem(BLURB_STORAGE_KEY, JSON.stringify(items));
}

export interface BlurbLibraryState {
  blurbs: BlurbLibraryItem[];
  searchQuery: string;
  categoryFilter: BlurbCategory | "All";
}

export interface BlurbLibraryView {
  filteredBlurbs: BlurbLibraryItem[];
  activeBlurbs: BlurbLibraryItem[];
}

export interface BlurbLibraryHandlers {
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: BlurbCategory | "All") => void;
  createBlurb: (input: Omit<BlurbLibraryItem, "id">) => void;
  updateBlurb: (blurbId: string, patch: Partial<Omit<BlurbLibraryItem, "id">>) => void;
  deactivateBlurb: (blurbId: string) => void;
}

export interface BlurbLibraryModel {
  state: BlurbLibraryState;
  view: BlurbLibraryView;
  handlers: BlurbLibraryHandlers;
}

export function useBlurbLibrary(): BlurbLibraryModel {
  const [blurbs, setBlurbs] = useState<BlurbLibraryItem[]>(() => loadBlurbs());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BlurbCategory | "All">("All");

  const persist = (next: BlurbLibraryItem[]) => {
    setBlurbs(next);
    saveBlurbs(next);
  };

  const filteredBlurbs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...blurbs]
      .filter((blurb) => {
        const matchesCategory = categoryFilter === "All" || blurb.category === categoryFilter;
        const haystack = [blurb.title, blurb.category, ...(blurb.tags ?? []), blurb.contentPlaintext]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [blurbs, categoryFilter, searchQuery]);

  const activeBlurbs = useMemo(
    () => blurbs.filter((blurb) => blurb.isActive),
    [blurbs],
  );

  const createBlurb = (input: Omit<BlurbLibraryItem, "id">) => {
    persist([{ ...input, id: crypto.randomUUID() }, ...blurbs]);
  };

  const updateBlurb = (blurbId: string, patch: Partial<Omit<BlurbLibraryItem, "id">>) => {
    persist(blurbs.map((blurb) => (blurb.id === blurbId ? { ...blurb, ...patch } : blurb)));
  };

  const deactivateBlurb = (blurbId: string) => {
    updateBlurb(blurbId, { isActive: false });
  };

  return {
    state: {
      blurbs,
      searchQuery,
      categoryFilter,
    },
    view: {
      filteredBlurbs,
      activeBlurbs,
    },
    handlers: {
      setSearchQuery,
      setCategoryFilter,
      createBlurb,
      updateBlurb,
      deactivateBlurb,
    },
  };
}

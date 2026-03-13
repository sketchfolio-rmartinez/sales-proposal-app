import { useMemo, useState } from "react";
import { blurbCategories } from "../app/blurbConfig";
import { BlurbCategory, BlurbLibraryItem } from "../types";

interface BlurbPickerModalProps {
  title: string;
  blurbs: BlurbLibraryItem[];
  allowedCategories?: BlurbCategory[];
  selectedIds: string[];
  selectionMode: "single" | "multiple";
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

export function BlurbPickerModal({
  title,
  blurbs,
  allowedCategories,
  selectedIds,
  selectionMode,
  onClose,
  onConfirm,
}: BlurbPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BlurbCategory | "All">("All");
  const [draftSelection, setDraftSelection] = useState<string[]>(selectedIds);

  const selectableBlurbs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blurbs.filter((blurb) => {
      const categoryAllowed = !allowedCategories || allowedCategories.includes(blurb.category);
      const categoryMatches = categoryFilter === "All" || blurb.category === categoryFilter;
      const haystack = [blurb.title, blurb.category, ...(blurb.tags ?? []), blurb.contentPlaintext]
        .join(" ")
        .toLowerCase();
      return categoryAllowed && categoryMatches && (!query || haystack.includes(query));
    });
  }, [allowedCategories, blurbs, categoryFilter, searchQuery]);

  const toggleSelection = (blurbId: string) => {
    if (selectionMode === "single") {
      setDraftSelection([blurbId]);
      return;
    }

    setDraftSelection((current) =>
      current.includes(blurbId) ? current.filter((id) => id !== blurbId) : [...current, blurbId],
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="row">
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="modal-toolbar">
          <input placeholder="Search blurbs" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as BlurbCategory | "All")}>
            <option value="All">All Categories</option>
            {blurbCategories
              .filter((category) => !allowedCategories || allowedCategories.includes(category))
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        <div className="modal-list">
          {selectableBlurbs.map((blurb) => {
            const checked = draftSelection.includes(blurb.id);
            return (
              <label key={blurb.id} className="modal-list-item">
                <input
                  type={selectionMode === "single" ? "radio" : "checkbox"}
                  name="blurb-picker"
                  checked={checked}
                  onChange={() => toggleSelection(blurb.id)}
                />
                <span>
                  <strong>{blurb.title}</strong> <em>{blurb.category}</em>
                  <span className="modal-list-copy">{blurb.contentPlaintext}</span>
                </span>
              </label>
            );
          })}
          {selectableBlurbs.length === 0 && <p className="muted">No blurbs match this filter.</p>}
        </div>

        <div className="row">
          <span className="muted">{draftSelection.length} selected</span>
          <button className="next-btn" onClick={() => onConfirm(draftSelection)}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

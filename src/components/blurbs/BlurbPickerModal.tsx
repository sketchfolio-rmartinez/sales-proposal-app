import { useMemo, useState } from "react";
import { blurbCategories } from "../../app/blurbConfig";
import { BlurbCategory, BlurbLibraryItem } from "../../types";
import "./BlurbPickerModal.css";

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
    return [...blurbs]
      .filter((blurb) => {
        const categoryAllowed = !allowedCategories || allowedCategories.includes(blurb.category);
        const categoryMatches = categoryFilter === "All" || blurb.category === categoryFilter;
        const haystack = [blurb.title, blurb.category, ...(blurb.tags ?? []), blurb.contentPlaintext]
          .join(" ")
          .toLowerCase();
        return categoryAllowed && categoryMatches && (!query || haystack.includes(query));
      })
      .sort((a, b) => a.title.localeCompare(b.title));
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
    <div className="blurb-picker-backdrop" onClick={onClose}>
      <div
        className="blurb-picker-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="blurb-picker-header">
          <div className="blurb-picker-heading">
            <p className="blurb-picker-kicker">Blurb Library</p>
            <h3>{title}</h3>
            <p className="blurb-picker-description">
              Pick the copy blocks you want attached to this scope item.
            </p>
          </div>
          <button
            type="button"
            className="blurb-picker-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="blurb-picker-toolbar">
          <input
            className="blurb-picker-search"
            placeholder="Search blurbs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className="blurb-picker-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as BlurbCategory | "All")
            }
          >
            <option value="All">All Categories</option>
            {blurbCategories
              .filter(
                (category) =>
                  !allowedCategories || allowedCategories.includes(category),
              )
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        <div className="blurb-picker-list">
          {selectableBlurbs.map((blurb) => {
            const checked = draftSelection.includes(blurb.id);
            return (
              <label
                key={blurb.id}
                className={`blurb-picker-item ${checked ? "is-selected" : ""}`}
              >
                <input
                  className="blurb-picker-item-input"
                  type={selectionMode === "single" ? "radio" : "checkbox"}
                  name="blurb-picker"
                  checked={checked}
                  onChange={() => toggleSelection(blurb.id)}
                />
                <span
                  className="blurb-picker-item-check"
                  aria-hidden="true"
                >
                  {checked ? "✓" : ""}
                </span>
                <span className="blurb-picker-item-body">
                  <span className="blurb-picker-item-top">
                    <strong>{blurb.title}</strong>
                    <em>{blurb.category}</em>
                  </span>
                  <span className="blurb-picker-item-copy">
                    {blurb.contentPlaintext}
                  </span>
                </span>
              </label>
            );
          })}
          {selectableBlurbs.length === 0 && (
            <p className="blurb-picker-empty">No blurbs match this filter.</p>
          )}
        </div>

        <div className="blurb-picker-footer">
          <span className="blurb-picker-selection">
            {draftSelection.length} selected
          </span>
          <button
            type="button"
            className="blurb-picker-insert"
            onClick={() => onConfirm(draftSelection)}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

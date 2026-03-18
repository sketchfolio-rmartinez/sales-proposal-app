import { useMemo, useState } from "react";
import { blurbCategories } from "../../app/blurbConfig";
import { BlurbCategory, BlurbLibraryItem } from "../../types";

interface BlurbAdminPageProps {
  blurbs: BlurbLibraryItem[];
  searchQuery: string;
  categoryFilter: BlurbCategory | "All";
  onSearchQueryChange: (query: string) => void;
  onCategoryFilterChange: (category: BlurbCategory | "All") => void;
  onCreateBlurb: (input: Omit<BlurbLibraryItem, "id">) => void;
  onUpdateBlurb: (
    blurbId: string,
    patch: Partial<Omit<BlurbLibraryItem, "id">>,
  ) => void;
  onDeactivateBlurb: (blurbId: string) => void;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function BlurbAdminPage({
  blurbs,
  searchQuery,
  categoryFilter,
  onSearchQueryChange,
  onCategoryFilterChange,
  onCreateBlurb,
  onUpdateBlurb,
  onDeactivateBlurb,
}: BlurbAdminPageProps) {
  const [draft, setDraft] = useState<Omit<BlurbLibraryItem, "id">>({
    title: "",
    category: "General RFP",
    tags: [],
    contentPlaintext: "",
    isActive: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const editingBlurb = useMemo(
    () => blurbs.find((b) => b.id === editingId) ?? null,
    [blurbs, editingId],
  );

  const selectBlurb = (blurb: BlurbLibraryItem) => {
    setEditingId(blurb.id);
    setDraft({
      title: blurb.title,
      category: blurb.category,
      tags: blurb.tags ?? [],
      contentPlaintext: blurb.contentPlaintext,
      isActive: blurb.isActive,
    });
  };

  const createNew = () => {
    setEditingId(null);
    setDraft({
      title: "",
      category: "General RFP",
      tags: [],
      contentPlaintext: "",
      isActive: true,
    });
  };

  const submit = () => {
    if (!draft.title.trim() || !draft.contentPlaintext.trim()) return;

    if (editingId) {
      onUpdateBlurb(editingId, draft);
    } else {
      onCreateBlurb(draft);
    }

    createNew();
  };

  return (
    <section className="blurb-admin-layout">
      {/* LEFT PANEL */}
      <div className="blurb-library">
        <div className="library-header">
          <h2>Blurb Library</h2>
          <button className="primary-btn" onClick={createNew}>
            + New Blurb
          </button>
        </div>

        <div className="library-filters">
          <input
            placeholder="Search blurbs..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            {blurbCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="blurb-list">
          {blurbs.map((blurb) => (
            <div
              key={blurb.id}
              className={`blurb-row ${editingId === blurb.id ? "selected" : ""}`}
              onClick={() => selectBlurb(blurb)}
            >
              <strong>{blurb.title}</strong>
              <span className="muted">{blurb.category}</span>

              {!blurb.isActive && (
                <span className="inactive-pill">Inactive</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="blurb-editor">
        <h3>{editingBlurb ? "Edit Blurb" : "Create Blurb"}</h3>

        <label>
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>

        <label>
          Category
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft({ ...draft, category: e.target.value as BlurbCategory })
            }
          >
            {blurbCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Tags
          <input
            value={(draft.tags ?? []).join(", ")}
            onChange={(e) =>
              setDraft({ ...draft, tags: parseTags(e.target.value) })
            }
          />
        </label>

        <label>
          Content
          <textarea
            rows={10}
            value={draft.contentPlaintext}
            onChange={(e) =>
              setDraft({ ...draft, contentPlaintext: e.target.value })
            }
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          />
          Active
        </label>

        <div className="editor-actions">
          <button className="primary-btn" onClick={submit}>
            {editingBlurb ? "Save Changes" : "Create Blurb"}
          </button>

          {editingBlurb && (
            <button
              className="danger-btn"
              onClick={() => onDeactivateBlurb(editingBlurb.id)}
            >
              Deactivate
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

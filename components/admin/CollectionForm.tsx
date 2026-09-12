"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorialCollection, Post, Tool } from "@/lib/types";
import { getCollectionOptions, saveCollection } from "@/app/admin/intelligence-actions";

type PickerOption = {
  slug: string;
  label: string;
  description?: string;
  status: "draft" | "published";
};

type PendingCreate = "tool" | "post" | null;

function Picker({
  title,
  description,
  options,
  selected,
  search,
  onSearch,
  onToggle,
  createHref,
  createLabel,
  onCreate,
  emptyLabel,
}: {
  title: string;
  description: string;
  options: PickerOption[];
  selected: string[];
  search: string;
  onSearch: (value: string) => void;
  onToggle: (slug: string) => void;
  createHref: string;
  createLabel: string;
  onCreate: () => void;
  emptyLabel: string;
}) {
  const query = search.trim().toLowerCase();
  const filtered = options.filter((item) =>
    !query || item.label.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query),
  );

  return (
    <section className="cms-content-picker">
      <div className="cms-content-picker-head">
        <div>
          <span className="cms-kicker">Collection content</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <a className="cms-secondary" href={createHref} target="_blank" rel="noreferrer" onClick={onCreate}>
          {createLabel} ↗
        </a>
      </div>

      <div className="cms-content-picker-search">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={`Search ${title.toLowerCase()} by name or slug`}
        />
        <span>{selected.length} selected</span>
      </div>

      <div className="cms-content-picker-list">
        {filtered.length ? filtered.map((item) => {
          const checked = selected.includes(item.slug);
          return (
            <label className={`cms-content-picker-item${checked ? " selected" : ""}`} key={item.slug}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(item.slug)} />
              <span className="cms-content-picker-copy">
                <strong>{item.label}</strong>
                <small>{item.slug}</small>
                {item.description && <em>{item.description}</em>}
              </span>
              <span className={`cms-content-status ${item.status}`}>{item.status}</span>
            </label>
          );
        }) : <div className="cms-content-picker-empty">{emptyLabel}</div>}
      </div>

      {selected.length > 0 && (
        <div className="cms-content-picker-selected">
          {selected.map((slug) => {
            const item = options.find((option) => option.slug === slug);
            return (
              <button type="button" key={slug} onClick={() => onToggle(slug)} title={`Remove ${item?.label || slug}`}>
                {item?.label || slug} <span>×</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function CollectionForm({ collection, tools, posts }: { collection?: EditorialCollection | null; tools: Tool[]; posts: Post[] }) {
  const [toolOptions, setToolOptions] = useState<PickerOption[]>(() => tools.map((tool) => ({
    slug: tool.slug,
    label: tool.name,
    description: tool.tagline,
    status: tool.status,
  })));
  const [postOptions, setPostOptions] = useState<PickerOption[]>(() => posts.map((post) => ({
    slug: post.slug,
    label: post.title,
    description: post.summary,
    status: post.status,
  })));
  const [selectedTools, setSelectedTools] = useState<string[]>(collection?.toolSlugs || []);
  const [selectedPosts, setSelectedPosts] = useState<string[]>(collection?.postSlugs || []);
  const [toolSearch, setToolSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const pendingCreate = useRef<PendingCreate>(null);

  const toggle = (slug: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  const refreshOptions = useCallback(async (autoSelectNew = false) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const beforeToolSlugs = new Set(toolOptions.map((item) => item.slug));
      const beforePostSlugs = new Set(postOptions.map((item) => item.slug));
      const next = await getCollectionOptions();
      const nextTools: PickerOption[] = next.tools.map((tool) => ({ ...tool }));
      const nextPosts: PickerOption[] = next.posts.map((post) => ({ ...post }));
      setToolOptions(nextTools);
      setPostOptions(nextPosts);

      if (autoSelectNew && pendingCreate.current === "tool") {
        const added = nextTools.filter((item) => !beforeToolSlugs.has(item.slug));
        if (added.length === 1) {
          setSelectedTools((current) => current.includes(added[0].slug) ? current : [...current, added[0].slug]);
          setNotice(`${added[0].label} was added to this collection.`);
          pendingCreate.current = null;
        } else if (added.length > 1) {
          setNotice("New tools were found. Select the one you want to add.");
          pendingCreate.current = null;
        } else {
          setNotice("No new tool detected yet. Finish creating it in the other tab, then come back here.");
        }
      } else if (autoSelectNew && pendingCreate.current === "post") {
        const added = nextPosts.filter((item) => !beforePostSlugs.has(item.slug));
        if (added.length === 1) {
          setSelectedPosts((current) => current.includes(added[0].slug) ? current : [...current, added[0].slug]);
          setNotice(`${added[0].label} was added to this collection.`);
          pendingCreate.current = null;
        } else if (added.length > 1) {
          setNotice("New articles were found. Select the one you want to add.");
          pendingCreate.current = null;
        } else {
          setNotice("No new article detected yet. Finish creating it in the other tab, then come back here.");
        }
      } else {
        setNotice("Available tools and articles refreshed.");
      }
    } catch {
      setNotice("Could not refresh collection content. Try again in a moment.");
    } finally {
      setRefreshing(false);
    }
  }, [postOptions, refreshing, toolOptions]);

  useEffect(() => {
    const handleFocus = () => {
      if (pendingCreate.current) void refreshOptions(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshOptions]);

  return (
    <form action={saveCollection} className="cms-editor">
      {collection && <input type="hidden" name="originalSlug" value={collection.slug} />}
      <input type="hidden" name="toolSlugs" value={selectedTools.join(",")} />
      <input type="hidden" name="postSlugs" value={selectedPosts.join(",")} />

      <div className="cms-form-grid two">
        <label>Collection title<input name="title" required defaultValue={collection?.title} /></label>
        <label>Slug<input name="slug" defaultValue={collection?.slug} placeholder="generated-from-title" /><small>Leave blank and RapidReach will generate it from the title.</small></label>
      </div>

      <label>Description<textarea name="description" required rows={4} defaultValue={collection?.description} /></label>

      <Picker
        title="Tools"
        description="Search and select existing tools. RapidReach stores their slugs behind the scenes."
        options={toolOptions}
        selected={selectedTools}
        search={toolSearch}
        onSearch={setToolSearch}
        onToggle={(slug) => toggle(slug, setSelectedTools)}
        createHref="/admin/tools/new"
        createLabel="Create new tool"
        onCreate={() => {
          pendingCreate.current = "tool";
          setNotice("Create the tool in the new tab. When you return, RapidReach will refresh and select it if it is the only new tool.");
        }}
        emptyLabel="No matching tools yet. Create a new tool, then return here."
      />

      <Picker
        title="Articles"
        description="Search and select existing articles. Drafts are visible here, but only published articles appear on public collection pages."
        options={postOptions}
        selected={selectedPosts}
        search={postSearch}
        onSearch={setPostSearch}
        onToggle={(slug) => toggle(slug, setSelectedPosts)}
        createHref="/admin/posts/new"
        createLabel="Create new article"
        onCreate={() => {
          pendingCreate.current = "post";
          setNotice("Create the article in the new tab. When you return, RapidReach will refresh and select it if it is the only new article.");
        }}
        emptyLabel="No matching articles yet. Create a new article, then return here."
      />

      <div className="cms-content-picker-refresh-row">
        <button className="cms-secondary" type="button" disabled={refreshing} onClick={() => void refreshOptions(false)}>
          {refreshing ? "Refreshing…" : "Refresh available content"}
        </button>
        {notice && <p>{notice}</p>}
      </div>

      <div className="cms-form-grid two">
        <label>Status<select name="status" defaultValue={collection?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        <label className="cms-check collection-featured"><input name="featured" type="checkbox" defaultChecked={collection?.featured} /> Feature collection on tools page</label>
      </div>

      <p className="cms-content-picker-note">Draft tools or articles can be grouped now, but they will not appear on the public collection page until they are published.</p>

      <div className="cms-editor-actions"><button className="cms-primary" type="submit">{collection ? "Save collection" : "Create collection"}</button><a className="cms-secondary" href="/admin/collections">Cancel</a></div>
    </form>
  );
}

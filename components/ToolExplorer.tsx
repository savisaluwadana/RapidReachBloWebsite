"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import type { Category, Tool } from "@/lib/types";

function launchTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function ToolExplorer({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [pricing, setPricing] = useState("all");
  const [openSource, setOpenSource] = useState(false);
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...tools]
      .filter((tool) => !q || [tool.name, tool.tagline, tool.description, tool.maker, ...tool.tags].filter(Boolean).join(" ").toLowerCase().includes(q))
      .filter((tool) => category === "all" || tool.category === category)
      .filter((tool) => pricing === "all" || tool.pricing === pricing)
      .filter((tool) => !openSource || tool.openSource)
      .sort((a, b) => sort === "upvotes" ? b.upvotes - a.upvotes : sort === "newest" ? launchTimestamp(b.launchedAt) - launchTimestamp(a.launchedAt) : Number(b.featured) - Number(a.featured) || b.upvotes - a.upvotes);
  }, [tools, query, category, pricing, openSource, sort]);

  function toggle(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : current);
  }

  const compareHref = selected.length === 2
    ? `/compare/${selected[0]}-vs-${selected[1]}`
    : `/compare?tools=${encodeURIComponent(selected.join(","))}`;

  return (
    <section className="tool-explorer">
      <div className="tool-filter-bar">
        <label className="tool-search-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, tags, makers…" /></label>
        <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><span>Pricing</span><select value={pricing} onChange={(event) => setPricing(event.target.value)}><option value="all">All pricing</option><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option><option value="open-source">Open source</option></select></label>
        <label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="upvotes">Most upvoted</option></select></label>
        <label className="tool-filter-check"><input type="checkbox" checked={openSource} onChange={(event) => setOpenSource(event.target.checked)} /> Open source only</label>
      </div>

      <div className="tool-explorer-meta"><span>{filtered.length} tool{filtered.length === 1 ? "" : "s"}</span><span>Select 2–4 tools to compare</span></div>
      <div className="tool-list">{filtered.map((tool) => (
        <div className={`tool-select-wrap ${selected.includes(tool.slug) ? "selected" : ""}`} key={tool.slug}>
          <label className="tool-compare-check"><input type="checkbox" checked={selected.includes(tool.slug)} onChange={() => toggle(tool.slug)} /> Compare</label>
          <ToolCard tool={tool} />
        </div>
      ))}</div>
      {!filtered.length && <div className="account-empty"><h3>No tools match those filters.</h3><p>Try a broader search or remove one of the filters.</p></div>}

      {selected.length > 0 && <div className="compare-dock"><div><strong>{selected.length}</strong><span>selected</span></div><button type="button" onClick={() => setSelected([])}>Clear</button>{selected.length >= 2 ? <Link href={compareHref}>Compare tools ↗</Link> : <span>Select one more tool</span>}</div>}
    </section>
  );
}

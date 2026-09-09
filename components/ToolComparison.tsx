import Link from "next/link";
import type { Tool } from "@/lib/types";

function list(items?: string[]) {
  return items?.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <span className="compare-muted">Not specified</span>;
}

export function ToolComparison({ tools }: { tools: Tool[] }) {
  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <thead><tr><th>Signal</th>{tools.map((tool) => <th key={tool.slug}><Link href={`/tools/${tool.slug}`}>{tool.name}</Link></th>)}</tr></thead>
        <tbody>
          <tr><th>Best for</th>{tools.map((tool) => <td key={tool.slug}>{list(tool.bestFor)}</td>)}</tr>
          <tr><th>Pricing</th>{tools.map((tool) => <td key={tool.slug}>{tool.pricing === "open-source" ? "Open source" : tool.pricing}</td>)}</tr>
          <tr><th>Open source</th>{tools.map((tool) => <td key={tool.slug}>{tool.openSource ? "Yes" : "No"}</td>)}</tr>
          <tr><th>Strengths</th>{tools.map((tool) => <td key={tool.slug}>{list(tool.strengths)}</td>)}</tr>
          <tr><th>Trade-offs</th>{tools.map((tool) => <td key={tool.slug}>{list(tool.tradeoffs)}</td>)}</tr>
          <tr><th>Not ideal for</th>{tools.map((tool) => <td key={tool.slug}>{list(tool.notIdealFor)}</td>)}</tr>
          <tr><th>RapidReach verdict</th>{tools.map((tool) => <td key={tool.slug}>{tool.verdict || "Editorial verdict coming soon."}</td>)}</tr>
          <tr><th>Links</th>{tools.map((tool) => <td key={tool.slug}><a href={tool.website} target="_blank" rel="noreferrer">Website ↗</a>{tool.github && <> · <a href={tool.github} target="_blank" rel="noreferrer">GitHub ↗</a></>}</td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

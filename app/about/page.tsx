import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Editorial Standards",
  description: "How RapidReach covers developer technology, evaluates tools, separates editorial judgment from promotion, and corrects mistakes.",
};

const standards = [
  {
    number: "01",
    title: "Signal over volume",
    body: "RapidReach prioritizes developments that can change engineering decisions, workflows, architecture, tooling, cost, reliability, or the way software teams operate. Publishing more is not the goal; filtering better is.",
  },
  {
    number: "02",
    title: "Builders first",
    body: "Coverage starts from the perspective of engineers, operators, maintainers, technical founders, and platform teams. We ask what changed for the person building or running software, not only what a company announced.",
  },
  {
    number: "03",
    title: "Context before hype",
    body: "A launch, funding round, benchmark, or release is not automatically important. RapidReach tries to explain the underlying shift, trade-offs, alternatives, and practical consequence before amplifying a headline.",
  },
  {
    number: "04",
    title: "Transparent tool coverage",
    body: "Tool pages and comparisons should explain who a product is for, what it does well, where it does not fit, pricing or open-source status when known, and the evidence behind any recommendation.",
  },
  {
    number: "05",
    title: "Editorial stays editorial",
    body: "Sponsored or paid material should be clearly identified. Payment should not determine the conclusion of an editorial review, ranking, comparison, or recommendation presented as independent analysis.",
  },
  {
    number: "06",
    title: "Corrections stay visible",
    body: "Material factual errors should be corrected rather than quietly preserved. Articles can carry updated timestamps, and meaningful corrections should be acknowledged when they affect the substance of the story.",
  },
  {
    number: "07",
    title: "Sources should be traceable",
    body: "Reporting should point readers toward primary documentation, project releases, repositories, maintainers, engineering posts, direct statements, or other verifiable sources whenever those sources materially support the story.",
  },
  {
    number: "08",
    title: "Readable beyond the page",
    body: "RapidReach treats structured metadata, feeds, APIs, semantic HTML, and machine-readable access as part of publishing. Good information should be understandable to readers, search systems, and software agents without losing provenance.",
  },
];

export default function AboutPage() {
  return (
    <section className="about-brand shell">
      <header className="about-brand-hero">
        <span className="section-kicker">RapidReach / About</span>
        <h1>Better filters for people who build software.</h1>
        <p>RapidReach is an independent developer-intelligence publication focused on the technology, tools, and engineering shifts that change how software gets built and operated.</p>
      </header>

      <div className="editorial-standard-grid" aria-label="RapidReach editorial standards">
        {standards.map((standard) => (
          <article className="editorial-standard" key={standard.number}>
            <span>{standard.number} / Standard</span>
            <h2>{standard.title}</h2>
            <p>{standard.body}</p>
          </article>
        ))}
      </div>

      <div className="about-brand-cta">
        <div><h2>Follow the signal, not the feed.</h2><p>Use Signal Desk for the fast-moving view, the Brief for the stories worth keeping, and Tool Watch when you need to understand the software behind the shift.</p></div>
        <Link href="/#signal-desk">Open Signal Desk ↗</Link>
      </div>
    </section>
  );
}

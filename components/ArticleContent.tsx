import type { ReactNode } from "react";
import styles from "./ArticleContent.module.css";

function isSafeHref(href: string) {
  return href.startsWith("https://") || href.startsWith("http://") || href.startsWith("/");
}

function renderLink(label: string, href: string, key: string): ReactNode {
  if (!isSafeHref(href)) return label;

  const external = href.startsWith("http://") || href.startsWith("https://");
  return (
    <a
      key={key}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {label}
    </a>
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\)|https?:\/\/[^\s<]+|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\*[^*\n]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const token = match[0];
    const markdownLink = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (markdownLink) {
      nodes.push(renderLink(markdownLink[1], markdownLink[2], `link-${key++}`));
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`strong-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(<s key={`strike-${key++}`}>{token.slice(2, -2)}</s>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={`code-${key++}`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`em-${key++}`}>{token.slice(1, -1)}</em>);
    } else {
      const trailingMatch = token.match(/^(.*?)([.,;:!?]+)?$/);
      const href = trailingMatch?.[1] || token;
      const punctuation = trailingMatch?.[2] || "";
      nodes.push(renderLink(href, href, `url-${key++}`));
      if (punctuation) nodes.push(punctuation);
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function isBlockStart(line: string) {
  return (
    /^#{2,4}\s+/.test(line) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^```/.test(line) ||
    /^!\[[^\]]*\]\((?:https?:\/\/|\/)[^)]+\)\s*$/.test(line) ||
    /^\s*(---|\*\*\*)\s*$/.test(line)
  );
}

export function ArticleContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockKey = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const image = line.trim().match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      const [, alt, src, caption] = image;
      blocks.push(
        <figure className={styles.inlineImage} key={`block-${blockKey++}`}>
          <img src={src} alt={alt} loading="lazy" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>,
      );
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```/, "").trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <pre className={styles.codeBlock} key={`block-${blockKey++}`}>
          <code data-language={language || undefined}>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const children = renderInline(heading[2].trim());
      if (level === 2) blocks.push(<h2 key={`block-${blockKey++}`}>{children}</h2>);
      else if (level === 3) blocks.push(<h3 key={`block-${blockKey++}`}>{children}</h3>);
      else blocks.push(<h4 key={`block-${blockKey++}`}>{children}</h4>);
      index += 1;
      continue;
    }

    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      blocks.push(<hr key={`block-${blockKey++}`} />);
      index += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, "").trim());
        index += 1;
      }
      blocks.push(
        <ul key={`block-${blockKey++}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
      }
      blocks.push(
        <ol key={`block-${blockKey++}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, "").trim());
        index += 1;
      }
      blocks.push(<blockquote key={`block-${blockKey++}`}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`block-${blockKey++}`}>{renderInline(paragraph.join(" "))}</p>);
  }

  return <div className={styles.content}>{blocks}</div>;
}

"use client";

import { upload } from "@vercel/blob/client";
import {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useRef,
  useState,
} from "react";
import { ArticleContent } from "@/components/ArticleContent";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function imageAlt(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/[\[\]]/g, "")
    .trim() || "Article image";
}

export function RichArticleEditor({ initialContent = "" }: { initialContent?: string }) {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef(initialContent);

  function updateContent(value: string) {
    contentRef.current = value;
    setContent(value);
  }

  function replaceSelection(replacement: string, selectFrom = replacement.length, selectTo = replacement.length) {
    const textarea = textareaRef.current;
    const current = contentRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? start;
    const next = `${current.slice(0, start)}${replacement}${current.slice(end)}`;
    updateContent(next);

    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(start + selectFrom, start + selectTo);
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    const textarea = textareaRef.current;
    const current = contentRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = current.slice(start, end) || placeholder;
    replaceSelection(`${prefix}${selected}${suffix}`, prefix.length, prefix.length + selected.length);
  }

  function prefixSelectedLines(prefix: string | ((index: number) => string)) {
    const textarea = textareaRef.current;
    const current = contentRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? start;
    const lineStart = current.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = current.indexOf("\n", end);
    const lineEnd = nextBreak === -1 ? current.length : nextBreak;
    const selected = current.slice(lineStart, lineEnd);
    const replacement = selected
      .split("\n")
      .map((line, index) => `${typeof prefix === "function" ? prefix(index) : prefix}${line}`)
      .join("\n");
    const next = `${current.slice(0, lineStart)}${replacement}${current.slice(lineEnd)}`;
    updateContent(next);

    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(lineStart, lineStart + replacement.length);
    });
  }

  function insertBlock(value: string) {
    const current = contentRef.current;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const before = start > 0 && !current.slice(0, start).endsWith("\n\n") ? "\n\n" : "";
    const after = start < current.length && !current.slice(start).startsWith("\n\n") ? "\n\n" : "";
    replaceSelection(`${before}${value}${after}`);
  }

  function insertLink() {
    const textarea = textareaRef.current;
    const current = contentRef.current;
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = current.slice(start, end);
    const label = selected || window.prompt("Link text", "Read more") || "Read more";
    const href = window.prompt("Link URL", "https://");
    if (!href) return;
    replaceSelection(`[${label.replace(/[\[\]]/g, "")}](${href.trim()})`);
  }

  async function uploadImages(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const markdown: string[] = [];
      for (let index = 0; index < images.length; index += 1) {
        const file = images[index];
        if (!ACCEPTED_IMAGE_TYPES.has(file.type)) throw new Error("Use JPEG, PNG, WebP, GIF, or AVIF images.");
        if (file.size > MAX_IMAGE_BYTES) throw new Error("Article images must be 8 MB or smaller.");

        const blob = await upload(
          `rapidreach/post-body/${Date.now()}-${index}-${safeName(file.name)}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/admin/media/upload",
            multipart: true,
            clientPayload: JSON.stringify({ kind: "post-body" }),
            onUploadProgress: ({ percentage }) => {
              const completeBefore = (index / images.length) * 100;
              setUploadProgress(Math.round(completeBefore + percentage / images.length));
            },
          },
        );
        markdown.push(`![${imageAlt(file.name)}](${blob.url})`);
      }

      insertBlock(markdown.join("\n\n"));
      setUploadProgress(100);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload the article image.");
    } finally {
      setUploading(false);
    }
  }

  async function onImageInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    await uploadImages(files);
    event.target.value = "";
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.files || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    void uploadImages(files);
  }

  function onDrop(event: DragEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    void uploadImages(files);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrapSelection("**", "**", "bold text");
    } else if (key === "i") {
      event.preventDefault();
      wrapSelection("*", "*", "italic text");
    } else if (key === "k") {
      event.preventDefault();
      insertLink();
    }
  }

  return (
    <section className="cms-rich-editor">
      <input type="hidden" name="content" value={content} />
      <div className="cms-rich-editor-head">
        <div>
          <span className="cms-media-label">Article body</span>
          <p>Format the story with headings, emphasis, links, lists, quotes, code, dividers, and inline images.</p>
        </div>
        <div className="cms-editor-view-toggle" aria-label="Article editor view">
          <button type="button" className={!preview ? "active" : ""} onClick={() => setPreview(false)}>Write</button>
          <button type="button" className={preview ? "active" : ""} onClick={() => setPreview(true)}>Preview</button>
        </div>
      </div>

      <div className="cms-format-toolbar" role="toolbar" aria-label="Article formatting">
        <button type="button" title="Heading 2" onClick={() => prefixSelectedLines("## ")}>H2</button>
        <button type="button" title="Heading 3" onClick={() => prefixSelectedLines("### ")}>H3</button>
        <button type="button" title="Bold (⌘/Ctrl+B)" onClick={() => wrapSelection("**", "**", "bold text")}><strong>B</strong></button>
        <button type="button" title="Italic (⌘/Ctrl+I)" onClick={() => wrapSelection("*", "*", "italic text")}><em>I</em></button>
        <button type="button" title="Strikethrough" onClick={() => wrapSelection("~~", "~~", "struck text")}><s>S</s></button>
        <button type="button" title="Quote" onClick={() => prefixSelectedLines("> ")}>Quote</button>
        <button type="button" title="Bulleted list" onClick={() => prefixSelectedLines("- ")}>• List</button>
        <button type="button" title="Numbered list" onClick={() => prefixSelectedLines((index) => `${index + 1}. `)}>1. List</button>
        <button type="button" title="Link (⌘/Ctrl+K)" onClick={insertLink}>Link</button>
        <button type="button" title="Inline code" onClick={() => wrapSelection("`", "`", "code")}>Code</button>
        <button type="button" title="Code block" onClick={() => insertBlock("```\ncode\n```")}>Code block</button>
        <button type="button" title="Divider" onClick={() => insertBlock("---")}>Divider</button>
        <button type="button" title="Upload inline image" disabled={uploading} onClick={() => imageInputRef.current?.click()}>
          {uploading ? `Uploading ${uploadProgress}%` : "Image"}
        </button>
      </div>

      <input
        ref={imageInputRef}
        className="cms-hidden-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        onChange={onImageInput}
      />

      {!preview ? (
        <textarea
          ref={textareaRef}
          className="cms-content-editor cms-rich-textarea"
          required
          rows={24}
          value={content}
          onChange={(event) => updateContent(event.target.value)}
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={(event) => {
            if (Array.from(event.dataTransfer.items || []).some((item) => item.kind === "file")) event.preventDefault();
          }}
          onKeyDown={onKeyDown}
          placeholder="Start writing… Use the toolbar, paste an image, or drag an image directly into the editor."
        />
      ) : (
        <div className="cms-article-preview">
          {content.trim() ? <ArticleContent content={content} /> : <p className="cms-preview-empty">Start writing to preview the article.</p>}
        </div>
      )}

      <div className="cms-rich-editor-foot">
        <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
        <span>Tip: paste or drag images directly into the writing area.</span>
      </div>
      {uploading && <progress className="cms-upload-progress" max="100" value={uploadProgress}>{uploadProgress}%</progress>}
      {error && <p className="cms-media-error" role="alert">{error}</p>}
    </section>
  );
}

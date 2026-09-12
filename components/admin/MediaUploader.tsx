"use client";

import { upload } from "@vercel/blob/client";
import { ChangeEvent, useState } from "react";

type MediaKind = "tool-logo" | "tool-screenshot" | "post-featured" | "submission-logo" | "submission-screenshot";

export function MediaUploader({
  inputName,
  label,
  kind,
  initialUrls = [],
  multiple = false,
  help,
  handleUploadUrl = "/api/admin/media/upload",
}: {
  inputName: string;
  label: string;
  kind: MediaKind;
  initialUrls?: string[];
  multiple?: boolean;
  help?: string;
  handleUploadUrl?: string;
}) {
  const [urls, setUrls] = useState(initialUrls.filter(Boolean));
  const [externalUrl, setExternalUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function safeName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  }

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (multiple && urls.length + files.length > 8) {
      setError("A tool can have up to 8 screenshots.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const uploaded: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file.type.startsWith("image/")) throw new Error("Only image files are supported.");
        if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.");

        const blob = await upload(
          `rapidreach/${kind}/${Date.now()}-${index}-${safeName(file.name)}`,
          file,
          {
            access: "public",
            handleUploadUrl,
            multipart: true,
            clientPayload: JSON.stringify({ kind }),
            onUploadProgress: ({ percentage }) => {
              const completed = (index / files.length) * 100;
              setProgress(Math.round(completed + percentage / files.length));
            },
          },
        );
        uploaded.push(blob.url);
      }

      setUrls((current) => multiple ? [...current, ...uploaded].slice(0, 8) : uploaded.slice(-1));
      setProgress(100);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function addExternalUrl() {
    const candidate = externalUrl.trim();
    if (!candidate) return;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "https:") {
        setError("External images must use HTTPS.");
        return;
      }
      setUrls((current) => multiple ? [...current, candidate].slice(0, 8) : [candidate]);
      setExternalUrl("");
      setError("");
    } catch {
      setError("Enter a valid HTTPS image URL.");
    }
  }

  function remove(index: number) {
    setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="cms-media-field">
      <div className="cms-media-head">
        <div><span className="cms-media-label">{label}</span>{help && <p>{help}</p>}</div>
        <span>{multiple ? `${urls.length}/8 images` : urls.length ? "Image selected" : "No image"}</span>
      </div>

      <input type="hidden" name={inputName} value={urls.join(",")} />

      {urls.length > 0 && (
        <div className={multiple ? "cms-media-grid" : "cms-media-grid single"}>
          {urls.map((url, index) => (
            <div className="cms-media-preview" key={`${url}-${index}`}>
              <img src={url} alt="" />
              <button type="button" onClick={() => remove(index)} aria-label={`Remove ${label.toLowerCase()} image ${index + 1}`}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="cms-media-controls">
        <label className="cms-upload-button">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multiple} onChange={onFiles} disabled={uploading} />
          {uploading ? `Uploading ${progress}%` : multiple ? "Upload screenshots" : "Upload image"}
        </label>
        <div className="cms-url-add">
          <input type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="Or paste an HTTPS image URL" />
          <button type="button" onClick={addExternalUrl}>Add URL</button>
        </div>
      </div>

      {uploading && <progress className="cms-upload-progress" max="100" value={progress}>{progress}%</progress>}
      {error && <p className="cms-media-error" role="alert">{error}</p>}
    </section>
  );
}

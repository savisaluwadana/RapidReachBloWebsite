import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

const mediaKinds = new Set(["tool-logo", "tool-screenshot", "post-featured"]);
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await isAdmin())) throw new Error("Unauthorized media upload.");

        let kind = "";
        try {
          kind = String(JSON.parse(clientPayload || "{}").kind || "");
        } catch {
          throw new Error("Invalid upload metadata.");
        }

        if (!mediaKinds.has(kind)) throw new Error("Unsupported media type.");
        if (!pathname.startsWith(`rapidreach/${kind}/`)) throw new Error("Invalid upload path.");

        return {
          allowedContentTypes: imageTypes,
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ kind }),
        };
      },
      onUploadCompleted: async () => {
        // The CMS stores the returned public URL when the editor form is saved.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload media." },
      { status: 400 },
    );
  }
}

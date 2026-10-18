// The API base used by apiClient.ts for JSON requests — kept separate here
// since file uploads need multipart/form-data, not JSON, and must NOT set
// a Content-Type header manually (the browser sets the multipart boundary).
// If your apiClient already exports a base URL constant, prefer that over
// this env var directly to avoid the two ever drifting apart.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class UploadError extends Error {}

export interface UploadedImage {
  url: string;
  filename: string;
}

/** Uploads a single image file and returns the URL to store on the record. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new UploadError(body?.message || "Could not upload image");
  }

  const body = await response.json();
  return body.data as UploadedImage;
}

/** Best-effort cleanup when a user replaces/removes an image before saving. */
export async function deleteUploadedImage(url: string): Promise<void> {
  const filename = url.split("/").pop();
  if (!filename) return;
  try {
    await fetch(`${API_BASE_URL}/uploads/image/${filename}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    // Non-critical — an orphaned file on disk isn't worth surfacing to the user.
  }
}

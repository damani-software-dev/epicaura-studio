import { supabase } from "@/integrations/supabase/client";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml", "video/mp4", "video/webm"];
const MAX = 25 * 1024 * 1024;

/** Upload to the private media bucket and return a long-lived signed URL. */
export async function uploadMedia(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Use JPG, PNG, WebP, GIF, AVIF, SVG, MP4 or WebM.");
  if (file.size > MAX) throw new Error("Files must be 25MB or smaller.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw new Error("Uploaded, but couldn't create a link.");
  return data.signedUrl;
}


import { supabase } from "@/integrations/supabase/client";
import * as tus from "tus-js-client";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const VIDEO_CHUNK_SIZE = 6 * 1024 * 1024;

const BUCKET = "media";

/** Upload a video using resumable TUS uploads. */
async function uploadVideo(file: File, path: string): Promise<void> {
  const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing.");
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: VIDEO_CHUNK_SIZE,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
        apikey: supabaseKey,
      },
      metadata: {
        bucketName: BUCKET,
        objectName: path,
        contentType: file.type,
        cacheControl: "31536000",
      },
      onError: (error) => reject(error),
      onSuccess: () => resolve(),
    });

    upload.start();
  });
}

/** Upload media and return a long-lived signed URL. */
export async function uploadMedia(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error(
      "Use JPG, PNG, WebP, GIF, AVIF, SVG, MP4 or WebM."
    );
  }

  const isVideo = file.type.startsWith("video/");

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      "Videos must be 50 MB or smaller on your current storage plan."
    );
  }

  if (!isVideo && file.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be 25 MB or smaller.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

  if (isVideo) {
    await uploadVideo(file, path);
  } else {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });

    if (error) throw new Error(error.message);
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);

  if (error || !data) {
    throw new Error("Uploaded, but couldn't create a link.");
  }

  return data.signedUrl;
}

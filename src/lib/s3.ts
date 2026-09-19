import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export function storageConfigured() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

export function s3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ALLOWED_MIME: Record<string, "image" | "video" | "audio" | "pdf" | "document" | "other"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/webm": "audio",
  "audio/mp4": "audio",
  "application/pdf": "pdf",
  "text/plain": "document",
  "text/markdown": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
};

export function classifyMime(mime: string) {
  if (ALLOWED_MIME[mime]) return ALLOWED_MIME[mime];
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "other";
}

export function isAllowedMime(mime: string) {
  return Boolean(ALLOWED_MIME[mime]) || mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/");
}

export function publicUrlFor(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, "");
  const bucket = process.env.S3_BUCKET;
  if (endpoint && bucket) return `${endpoint}/${bucket}/${key}`;
  return "";
}

export async function uploadBufferToStorage(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const bucket = process.env.S3_BUCKET!;
  const ext = params.fileName.includes(".") ? params.fileName.split(".").pop() : "bin";
  const key = `journal/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
  const client = s3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
    })
  );
  return { key, url: publicUrlFor(key) || key };
}

export async function presignedGetUrl(key: string, expiresIn = 3600) {
  const client = s3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn }
  );
}

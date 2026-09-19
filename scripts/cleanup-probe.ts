// One-off cleanup for probe artifacts. Prints statuses only.
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../src/lib/s3";

async function main() {
  const client: S3Client = s3Client();
  const bucket = process.env.S3_BUCKET || "uploads";
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: "__probe__/ping.txt" }));
  console.log("cleanup=ok");
}

main().catch((e) => {
  console.log("FAILED:" + (e as Error).message.split("\n")[0].slice(0, 200));
  process.exit(1);
});

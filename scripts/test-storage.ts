// Probe Neon Object Storage: upload a ping file, check public readability,
// verify presigned URLs work. Prints statuses only — never credentials/URLs.
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, publicUrlFor } from "../src/lib/s3";

const bucket = process.env.S3_BUCKET || "uploads";
const key = "__probe__/ping.txt";

async function main() {
  const client: S3Client = s3Client();
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from("ping"), ContentType: "text/plain" })
  );
  console.log("put=ok");

  const publicUrl = publicUrlFor(key);
  console.log("publicUrlBuilt=" + (publicUrl ? "yes" : "no"));
  if (publicUrl) {
    try {
      const res = await fetch(publicUrl);
      console.log("publicGet=" + res.status);
    } catch (e) {
      console.log("publicGet=error:" + (e as Error).message.slice(0, 80));
    }
  }

  const signed = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 60 }
  );
  const sres = await fetch(signed);
  const stext = await sres.text().catch(() => "");
  console.log("signedGet=" + sres.status + " body=" + stext.slice(0, 300));

  // Retry with virtual-hosted style addressing
  const vhost = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
  const signed2 = await getSignedUrl(vhost, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 60 });
  const sres2 = await fetch(signed2);
  const stext2 = await sres2.text().catch(() => "");
  console.log("signedVhostGet=" + sres2.status + " body=" + stext2.slice(0, 300));

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log("cleanup=ok");
}

main().catch((e) => {
  console.log("FAILED:" + (e as Error).message.split("\n")[0].slice(0, 200));
  process.exit(1);
});

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "you@example.com" },
    update: {},
    create: { id: "demo-user", email: "you@example.com", name: "Journal Owner" },
  });

  const count = await prisma.journalEntry.count({ where: { userId: user.id } });
  if (count > 0) {
    console.log(`Seed skipped: ${count} entries already exist.`);
    return;
  }

  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      title: "Welcome to your voice journal 🎙️",
      content: "<h2>Hello!</h2><p>This is your first entry. Try the <strong>Record voice</strong> button on New Entry — transcription lands here automatically.</p>",
      plainText: "Hello! This is your first entry. Try the Record voice button.",
      tags: ["welcome", "voice"],
      mood: "✨",
    },
  });

  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      title: "How this stores data",
      content: "<p>Text + transcripts live in <strong>Neon Postgres</strong>. Images, video, audio, PDFs live in <strong>S3/R2</strong> with URLs in Postgres.</p>",
      plainText: "Text + transcripts live in Neon Postgres. Media lives in S3/R2.",
      tags: ["guide", "neon", "s3"],
      mood: "📚",
    },
  });

  console.log("Seeded demo user + 2 entries.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

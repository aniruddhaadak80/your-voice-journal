-- Optional full-text index for large journals.
-- Run after `prisma migrate dev` if you want tsvector ranking:
--   psql $DATABASE_URL -f prisma/fulltext.sql

ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("plainText",''))) STORED;

CREATE INDEX IF NOT EXISTS "JournalEntry_searchVector_idx" ON "JournalEntry" USING GIN ("searchVector");

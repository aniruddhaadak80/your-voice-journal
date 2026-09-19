import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { defaultUserId } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const dbOk = await prisma
    .$queryRaw`SELECT 1`
    .then(() => true)
    .catch(() => false);
  return NextResponse.json({
    db: dbOk ? "connected" : "not configured",
    storage: process.env.S3_BUCKET ? "configured" : "not configured",
    ai: process.env.GEMINI_API_KEY ? "configured (gemini)" : "not configured",
    userId: defaultUserId(),
  });
}

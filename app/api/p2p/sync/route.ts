import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { appendFileEvent, joinUserSwarm } from "@/lib/p2p";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, fileId, fileName, size, mimeType } = body ?? {};

  if (!type || !fileId || !fileName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Make sure we're joined to the swarm (idempotent) before appending,
  // so the append gets picked up by any currently-connected peers.
  await joinUserSwarm(userId);

  const result = await appendFileEvent(userId, {
    type,
    fileId,
    fileName,
    size,
    mimeType,
    timestamp: Date.now(),
  });

  return NextResponse.json({ ok: true, ...result });
}

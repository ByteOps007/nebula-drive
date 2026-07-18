import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getSwarmStatus } from "@/lib/p2p";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = getSwarmStatus(userId);
  return NextResponse.json({ ok: true, status });
}

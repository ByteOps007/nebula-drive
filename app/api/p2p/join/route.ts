import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { joinUserSwarm } from "@/lib/p2p";

// Ensure this route always runs on the Node.js runtime (Hyperswarm/Hypercore
// need real UDP sockets + fs access, not the Edge runtime).
export const runtime = "nodejs";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await joinUserSwarm(userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Failed to join P2P swarm", err);
    return NextResponse.json(
      { error: "Failed to join P2P swarm" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileKey } = await req.json();
  if (!fileKey) {
    return NextResponse.json({ error: "Missing fileKey" }, { status: 400 });
  }

  try {
    await utapi.deleteFiles(fileKey);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("UploadThing delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

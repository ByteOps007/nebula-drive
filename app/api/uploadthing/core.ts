import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  driveUploader: f({
    // Nebula Drive accepts any file type up to 500MB, matching the
    // existing Dropzone limit.
    blob: { maxFileSize: "512MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Returned data is available to the client's onClientUploadComplete.
      // v7 uses `ufsUrl` as the canonical public URL field.
      return { userId: metadata.userId, url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

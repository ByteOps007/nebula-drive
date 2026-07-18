import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This ensures your landing page is public.
  // /api/uploadthing must also be public: UploadThing's servers call this
  // route directly (no Clerk session) to report that an upload finished.
  // It verifies authenticity itself via an HMAC signature, so it doesn't
  // need Clerk's protection — and if Clerk blocks it, uploads succeed but
  // the "upload complete" callback never reaches your app.
  publicRoutes: ["/", "/api/uploadthing(.*)"],
});

export const config = {
  matcher: [
    // This is the standard Clerk matcher that skips static files
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
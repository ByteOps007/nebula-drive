# 🌌 Nebula Drive - Cosmic Cloud Storage

Nebula Drive is a full-stack cloud storage platform built with **Next.js 14**, **Clerk**, **Firebase**, **UploadThing**, and a peer-to-peer sync layer powered by **Hypercore Protocol** and **Hyperswarm**.

## 🚀 Features

- **Secure Auth:** Clerk-powered sign-in/sign-up with Google OAuth support.
- **File Management:** Upload, rename, download, and delete files, backed by UploadThing storage.
- **Real-time Dashboard:** File list updates live via a Firestore listener — no manual refresh needed.
- **P2P Metadata Sync:** Every file event (upload/rename/delete) is appended to a per-user Hypercore log. Hyperswarm handles peer discovery and replication of that log, using its DHT for NAT traversal (hole punching) to establish direct peer connections.
- **Storage Usage Tracking:** Live-updating usage bar reflecting total bytes stored.
- **Theming:** Dark and light mode support.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** Clerk
- **Metadata & Real-time DB:** Firebase Firestore
- **File Storage:** UploadThing
- **P2P Sync Layer:** Hypercore Protocol + Hyperswarm
- **Styling:** Tailwind CSS & shadcn/ui

## ⚙️ Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root with the following:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   UPLOADTHING_TOKEN=your_uploadthing_token
   ```
   Firebase config is set directly in `firebase.ts` — update it there if you're pointing at your own Firebase project.
3. In your Firebase project, enable **Firestore Database** and set rules that allow authenticated access (see `firestore.rules` guidance in Firebase Console).
4. Run locally:
   ```bash
   npm run dev
   ```

### Notes on deployment

The Hyperswarm P2P layer needs a **persistent, long-running Node process** to stay connected to its swarm — it isn't compatible with fully serverless platforms like Vercel's default function model. For a live deployment where the P2P sync layer stays active, use a platform with persistent server processes (e.g. Railway, Render, or a VPS).

## About

"Enhance your personal storage with Nebula Drive, offering a simple and efficient way to upload, organize, and access files from anywhere. Securely store important documents and media, and experience the convenience of easy file management and sharing in one centralized solution."

"use client";
import { cn } from "@/lib/utils";
import DropzoneComponent from "react-dropzone";
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";
import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/lib/uploadthing";

const Dropzone = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useUser();
  const router = useRouter();
  // Track the current upload's Firestore doc id and File across the
  // callback-based flow below.
  const pendingRef = useRef<{ docId: string; file: File } | null>(null);

  const { startUpload } = useUploadThing("driveUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: async (res) => {
      const pending = pendingRef.current;
      const result = res?.[0];
      if (!user || !pending || !result) {
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      const toastId = `upload-${pending.docId}`;
      try {
        await updateDoc(doc(db, "users", user.id, "files", pending.docId), {
          downloadURL: result.ufsUrl ?? result.url,
          uploadthingKey: result.key,
        });

        fetch("/api/p2p/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "upload",
            fileId: pending.docId,
            fileName: pending.file.name,
            size: pending.file.size,
            mimeType: pending.file.type,
          }),
        }).catch((err) => console.error("P2P sync append failed", err));

        toast.success("Uploaded Successfully", { id: toastId });
        router.refresh();
      } catch (error) {
        console.error("Failed to finalize upload", error);
        toast.error("Upload failed", { id: toastId });
        await deleteDoc(doc(db, "users", user.id, "files", pending.docId)).catch(() => {});
        router.refresh();
      } finally {
        setLoading(false);
        setUploadProgress(0);
        pendingRef.current = null;
      }
    },
    onUploadError: async (error) => {
      console.error("Upload failed", error);
      const pending = pendingRef.current;
      const toastId = pending ? `upload-${pending.docId}` : undefined;
      toast.error(`Upload failed: ${error.message}`, { id: toastId });

      if (user && pending) {
        await deleteDoc(doc(db, "users", user.id, "files", pending.docId)).catch(() => {});
        router.refresh();
      }
      setLoading(false);
      setUploadProgress(0);
      pendingRef.current = null;
    },
  });

  const uploadPost = async (selectedFile: File) => {
    if (loading) return;
    if (!user) return;
    setLoading(true);

    // Create the Firestore record first so we have a fileId to reference,
    // same pattern as before.
    const docRef = await addDoc(collection(db, "users", user.id, "files"), {
      userId: user.id,
      fileName: selectedFile.name,
      fullName: user.fullName,
      profileImg: user.imageUrl,
      timeStamp: serverTimestamp(),
      type: selectedFile.type,
      size: selectedFile.size,
    });

    pendingRef.current = { docId: docRef.id, file: selectedFile };
    toast.loading("Uploading...", { id: `upload-${docRef.id}` });

    try {
      await startUpload([selectedFile]);
      // Completion/failure is handled by onClientUploadComplete /
      // onUploadError above, since startUpload's return value isn't
      // reliable across UploadThing versions.
    } catch (error) {
      console.error("startUpload threw", error);
      toast.error("Upload failed", { id: `upload-${docRef.id}` });
      await deleteDoc(doc(db, "users", user.id, "files", docRef.id)).catch(() => {});
      router.refresh();
      setLoading(false);
      setUploadProgress(0);
      pendingRef.current = null;
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadPost(file);
    });
  };

  // max file size 500MB
  const MAX_FILE_SIZE = 524288000;
  return (
    <DropzoneComponent
      minSize={0}
      maxSize={MAX_FILE_SIZE}
      onDrop={onDrop}
    >
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 &&
          fileRejections[0].file.size > MAX_FILE_SIZE;
        return (
          <section className="m-4">
            <div
              {...getRootProps()}
              className={cn(
                "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg text-center cursor-pointer",
                isDragActive
                  ? "bg-[#035FFE] text-white animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/70 text-slate-400"
              )}
            >
              <input {...getInputProps()} />
              {!isDragActive && "Click here or drop a file to upload!"}
              {isDragActive && !isDragReject && "Drop to upload this file!"}
              {isDragReject && "File type not accepted"}
              {isFileTooLarge && (
                <div className="text-danger mt-2">File is too Large</div>
              )}

              {loading && (
                <div className="w-full max-w-xs mt-4 space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}
            </div>
          </section>
        );
      }}
    </DropzoneComponent>
  );
};

export default Dropzone;

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/firebase";
import { useAppStore } from "@/store/store";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

import toast from "react-hot-toast";

export function DeleteModal() {

  const { user } = useUser();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen, fileId, setFileId] =
    useAppStore((state) => [
      state.isDeleteModalOpen,
      state.setIsDeleteModalOpen,
      state.fileId,
      state.setFileId,
    ]);
  async function deleteFile() {
    if (!user || !fileId) return;
    const toastId = toast.loading("Deleting...");
    const fileDocRef = doc(db, "users", user.id, "files", fileId);
    try {
      const snap = await getDoc(fileDocRef);
      const uploadthingKey = snap.data()?.uploadthingKey;

      if (uploadthingKey) {
        const res = await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKey: uploadthingKey }),
        });
        if (!res.ok) {
          throw new Error("Failed to delete file from storage");
        }
      }

      await deleteDoc(fileDocRef);
      toast.success("Deleted Sucessfully", { id: toastId });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Error deleting document", {
        id: toastId,
      });
    } finally {
      setIsDeleteModalOpen(false);
    }
  }
  return (
    <Dialog
      open={isDeleteModalOpen}
      onOpenChange={(isOpen) => {
        setIsDeleteModalOpen(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This permanently delete your file!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center space-x-2">
          <Button
            size="sm"
            className="px-3 flex-1"
            variant={"ghost"}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <span className="sr-only">Cancel</span>
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            variant={"destructive"}
            className="px-3 flex-1"
            onClick={() => deleteFile()}
          >
            <span className="sr-only">Delete</span>
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

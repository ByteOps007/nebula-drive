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
import { db, storage } from "@/firebase";
import { useAppStore } from "@/store/store";
import { useUser } from "@clerk/nextjs";
import { doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import { Input } from "./ui/input";

import toast from "react-hot-toast";

export function RenameModal() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen, fileId, filename] =
    useAppStore((state) => [
      state.isRenameModalOpen,
      state.setIsRenameModalOpen,
      state.fileId,
      state.filename,
    ]);
  const renameFile = async () => {
    if (!user || !fileId) return;
    const toastId = toast.loading("Renaming....");
    await updateDoc(doc(db, "users", user.id, "files", fileId), {
      fileName: input,
    })
      .then(() =>
        toast.success("Renamed Succesfully", {
          id: toastId,
        })
      )
      .catch((error) => {
        console.log(error);
        toast.error("Error Renaming the file", {
          id: toastId,
        });
      });

    setInput("");
    setIsRenameModalOpen(false);
  };
  return (
    <Dialog
      open={isRenameModalOpen}
      onOpenChange={(isOpen) => {
        setIsRenameModalOpen(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="m-1">Rename the File</DialogTitle>
          <Input
            id="link"
            defaultValue={filename}
            onChange={(e) => setInput(e.target.value)}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter") {
                renameFile();
              }
            }}
          />
          <div className="flex justify-end space-x-2 py-2">
            <Button
              size="sm"
              className="px-3"
              variant={"ghost"}
              onClick={() => setIsRenameModalOpen(false)}
            >
              <span className="sr-only">Cancel</span>
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={() => renameFile()}
            >
              <span className="sr-only">Rename</span>
              <span>Rename</span>
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

import { Upload, X, Image as ImageIcon } from "lucide-react";
import React, { useState } from "react";
import { UploadFileDTO, UploadingFilesDTO } from "../types/files.types";
import { UploadImageAPIS } from "../services/upload.service";
import { useUser } from "../context/UserContext";

interface UploadModalProps {
  albumID: string | null;
  uploadFile: boolean;
  fileType: string;
  onClose: () => void;
  setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFilesDTO[]>>;
  handleRefresh: (canRefresh: boolean) => void;
}

type AllowedState = {
  allowed: boolean;
  storageExceed: boolean;
};

export default function UploadModal({
  albumID,
  uploadFile,
  fileType,
  onClose,
  setUploadingFiles,
  handleRefresh,
}: UploadModalProps) {
  const { user } = useUser();

  const [upload, setUpload] = useState<UploadFileDTO>({ file: [] });
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [isAllowed, setIsAllowed] = useState<AllowedState>({
    allowed: true,
    storageExceed: false,
  });

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = e.target;

    if (!files) return;
    setUpload({ file: Array.from(files) });
  };

  // this tracks the uploadinf progress
  const handleUploadProgress = (fileId: string, progress: number) => {
    setUploadingFiles((prev) =>
      prev.map((upload) =>
        upload.id === fileId
          ? {
            ...upload,
            progress,
          }
          : upload,
      ),
    );
  };

  const onHandleUploadFile = async () => {
    // first check if we have enough storage or not

    // storage check starts here
    const maxStorageBytes = Number(user?.strorage) * 1024 ** 3;
    let totalSize = 0;

    for (let index = 0; index < upload.file.length; index++) {
      totalSize += upload.file[index].size;
    }

    const currentSize =
      Number(user?.userStorageComsumeSize) + Number(totalSize);

    const isAllowedToUpload = currentSize < maxStorageBytes;

    if (!isAllowedToUpload) {
      setIsAllowed((prev) => ({
        ...prev,
        storageExceed: true,
      }));

      return;
    }

    // we did not exceed storage
    setIsAllowed((prev) => ({
      ...prev,
      storageExceed: false,
    }));

    // storage check ends here

    let allow = true;

    switch (fileType) {
      case "Images":
      case "Album-Images":
        for (let index = 0; index < upload.file.length; index++) {
          const type = upload.file[index].type.split("/")[0];
          if (type !== "image") {
            allow = false;
            break;
          }
        }
        break;

      case "Videos":
      case "Album-Videos":
        for (let index = 0; index < upload.file.length; index++) {
          const type = upload.file[index].type.split("/")[0];

          if (type !== "video") {
            allow = false;
            break;
          }
        }
        break;
    }

    if (!allow) {
      setIsAllowed((prev) => ({
        ...prev,
        allowed: false,
      }));
      return;
    }

    setIsAllowed((prev) => ({
      ...prev,
      allowed: true,
    }));

    const newUploadingFiles: UploadingFilesDTO[] = upload.file.map((file) => ({

      id:
        typeof globalThis.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,

      file,
      progress: 0,
      status: "uploading",
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);
    setInProgress(true);

    try {
      const response = await UploadImageAPIS(
        albumID!,
        upload,
        newUploadingFiles,
        handleUploadProgress,
        fileType,
      );

      // re load the page after the upload completion
      if (response?.message === "Complete") {
        onClose();
        setUploadingFiles([]);
        setInProgress(false);
        handleRefresh(true);
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${uploadFile && !inProgress ? `opacity-100 scale-100` : `opacity-0 scale-0`} transition-all duration-200`}
    >
      <div className="w-full max-w-lg rounded-2xl bg-green-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-green-900">
            Upload {fileType}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-green-200 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Drop Zone */}
          <label
            htmlFor="upload"
            className="
              flex
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-2xl
              border-2
              border-dashed
              border-green-400
              bg-green-50
              p-12
              transition
              hover:bg-green-200/50
            "
          >
            <ImageIcon size={60} className="text-green-600" />

            <p className="mt-5 text-lg font-semibold text-green-900">
              Drag & Drop files
            </p>

            <p className="mt-2 text-sm text-green-700">or click to browse</p>

            <input
              required
              id="upload"
              type="file"
              accept={
                fileType === "Images" || fileType === "Album-Images"
                  ? "image/*"
                  : "video/*"
              }
              multiple
              className="hidden"
              onChange={onHandleChange}
            />
          </label>

          {/* Selected File */}
          <div className="mt-5 rounded-xl bg-white/60 p-4 text-sm text-green-900">
            {upload.file.length <= 0
              ? "No files selected."
              : `${upload.file.length} ${upload.file.length > 1 ? "Files Selected" : "File Selected"}`}
          </div>
        </div>

        <span className="text-red-500 flex justify-center uppercase font-black">
          {!isAllowed.allowed && "Not a valid file type"}
          {isAllowed.storageExceed && "Not Enough Space"}
        </span>
        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-green-200 px-6 py-4">
          <button
            onClick={onClose}
            className="
              rounded-xl
              bg-white
              px-5
              py-2
              font-medium
              text-green-900
              shadow
              transition
              hover:bg-green-50
            "
          >
            Cancel
          </button>

          <button
            onClick={onHandleUploadFile}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-green-600
              px-5
              py-2
              font-medium
              text-white
              shadow-lg
              transition
              hover:bg-green-700
            "
          >
            <Upload size={18} />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

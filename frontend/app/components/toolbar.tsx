import {
  FolderPlus,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { MediaResponseDTO } from "../types/files.types";
import DisplayStorage from "./display_storage";
import { useUser } from "../context/UserContext";
import { ChangeEvent } from "react";

interface ToolBarProps {
  mediaType: string;
  folderName: string;
  selectedFiles: MediaResponseDTO[];
  onOpenAndCloseCreateNewAlbum: () => void;
  onUploadFileOpenAndClose: () => void;
  OpenCloseAddToAlbumSelected: () => void;
  OpenCloseRestoreFiles: () => void;
  OpenCloseDeleteFilesSelected: () => void;
  // search props
  searchTag: string;
  handleOnChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSearchSubmit: () => void;
}

export default function ToolBar({
  mediaType,
  folderName,
  selectedFiles,
  onOpenAndCloseCreateNewAlbum,
  onUploadFileOpenAndClose,
  OpenCloseRestoreFiles,
  OpenCloseAddToAlbumSelected,
  OpenCloseDeleteFilesSelected,
  // search props
  searchTag,
  handleOnChange,
  handleSearchSubmit,
}: ToolBarProps) {
  const { user } = useUser();


  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/40 sm:p-5 transition-all duration-1000 ">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left - Folder information */}
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {mediaType !== "Album" ? "Current Media" : "Current Album"}
            </p>

            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-gray-900">
              {folderName}
            </h1>
          </div>

          {/* Selected count */}
          {selectedFiles?.length > 0 && (
            <div className="rounded-2xl bg-lime-50 px-4 py-2.5 text-center">
              <p className="text-2xl font-black leading-none text-lime-600">
                {selectedFiles?.length}
              </p>

              <p className="mt-1 text-xs font-medium text-lime-700">Selected</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={OpenCloseDeleteFilesSelected}
                  className="group flex h-11 w-11 items-center justify-center rounded-xl
               border border-red-500/20 bg-red-500/10 text-red-400
               shadow-sm backdrop-blur-sm
               transition-all duration-200
               hover:scale-105 hover:border-red-500/40 hover:bg-red-500/20
               hover:text-red-300 hover:shadow-lg hover:shadow-red-500/10
               active:scale-95"
                >
                  <Trash2
                    size={20}
                    className="transition-transform duration-200 group-hover:rotate-6"
                  />
                </button>

                {mediaType !== "Trash" && (
                  <button
                    onClick={OpenCloseAddToAlbumSelected}
                    className="group flex h-11 w-11 items-center justify-center rounded-xl
               border border-emerald-500/20 bg-emerald-500/10 text-emerald-400
               shadow-sm backdrop-blur-sm
               transition-all duration-200
               hover:scale-105 hover:border-emerald-500/40 hover:bg-emerald-500/20
               hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10
               active:scale-95"
                  >
                    <Plus
                      size={22}
                      className="transition-transform duration-200 group-hover:rotate-90"
                    />
                  </button>
                )}

                {/*Only display if its trash folder */}
                {mediaType === "Trash" && (
                  <button
                    onClick={OpenCloseRestoreFiles}
                    className="group flex h-11 w-11 items-center justify-center rounded-xl
               border border-emerald-500/20 bg-emerald-500/10 text-emerald-400
               shadow-sm backdrop-blur-sm
               transition-all duration-200
               hover:scale-105 hover:border-emerald-500/40 hover:bg-emerald-500/20
               hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10
               active:scale-95"
                  >
                    <RotateCcw
                      size={22}
                      className="transition-transform duration-200 group-hover:rotate-90"
                    />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <DisplayStorage
          totalConsumeSize={Number(user?.userStorageComsumeSize)}
          currentSizeInGB={Number(user?.strorage)}
          viewMode={2}
        />
        {/* Right - Search & actions */}
        {/*Disabled these when in trash mode*/}
        {mediaType !== "Trash" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:min-w-64">
              <input
                value={searchTag}
                onChange={handleOnChange}
                type="text"
                placeholder="Describe your image"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100"
              />

              <button
                onClick={handleSearchSubmit}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400  hover:cursor-pointer hover:text-gray-600"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {mediaType !== "Album-Videos" &&
                mediaType !== "Album-Images" && (
                  <button
                    type="button"
                    onClick={onOpenAndCloseCreateNewAlbum}
                    title="Create new album"
                    aria-label="Create new album"
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl active:translate-y-0"
                  >
                    <FolderPlus
                      size={21}
                      className="transition-transform group-hover:scale-110"
                    />
                  </button>
                )}

              <button
                type="button"
                onClick={onUploadFileOpenAndClose}
                title="Upload files"
                aria-label="Upload files"
                className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500 text-white shadow-lg shadow-lime-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-600 hover:shadow-xl active:translate-y-0"
              >
                <Upload
                  size={21}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

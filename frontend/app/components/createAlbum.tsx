import { ChangeEvent, FormEvent } from "react";
import { AlbumsDTO } from "../types/files.types";

interface CreateNewAlbumProbs {
  createNewAlbumOpen: boolean;
  onOpenAndCloseCreateNewAlbum: () => void;
  getAlbumName: AlbumsDTO;
  handleAlbumDataChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleAlbumCreate: (data: FormEvent<HTMLFormElement>) => void;
  albumExixts: boolean;
}

export default function CreateNewAlbum({
  createNewAlbumOpen,
  onOpenAndCloseCreateNewAlbum,
  getAlbumName,
  handleAlbumDataChange,
  handleAlbumCreate,
  albumExixts,
}: CreateNewAlbumProbs) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center 
        bg-black/50 ${createNewAlbumOpen ? `opacity-100 scale-100` : `opacity-0 scale-0`} duration-200 transition-all`}
    >
      <form
        onSubmit={handleAlbumCreate}
        className="w-full max-w-md rounded-2xl bg-green-100 p-6 shadow-2xl"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800">Create Album</h2>

        <p className="mt-2 text-gray-600">Give your new album a name.</p>

        {/* Input */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Album Name
          </label>

          <input
            name="albumName"
            value={getAlbumName.albumName}
            onChange={handleAlbumDataChange}
            type="text"
            placeholder="e.g. Family, Travel, Gym Progress"
            className="
          w-full rounded-xl border border-gray-200
          bg-white px-4 py-3
          text-gray-800
          outline-none
          transition-all duration-200
          focus:border-green-500
          focus:ring-2 focus:ring-green-300
        cursor-pointer
        "
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onOpenAndCloseCreateNewAlbum}
            className="
          rounded-lg bg-white px-5 py-2
          text-gray-700 shadow
          transition-all duration-200
          hover:bg-gray-50
          hover:shadow-lg
          hover:-translate-y-0.5
          active:scale-95
                  cursor-pointer

        "
          >
            Cancel
          </button>

          <button
            className="
          rounded-lg bg-green-600 px-5 py-2
          text-white shadow
          transition-all duration-200
          hover:bg-green-700
          hover:shadow-lg
          hover:-translate-y-0.5
          active:scale-95
        "
          >
            Create
          </button>
        </div>

        {albumExixts && (
          <label className="text-red-500 text-xl font-serif">
            {"Album name already exists"}
          </label>
        )}
      </form>
    </div>
  );
}

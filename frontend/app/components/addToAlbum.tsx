import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MediaResponseDTO } from "../types/files.types";
import { AddFileToAlbum } from "../services/createAlbum.service";

interface AddAlbumProbs {
  mediaType: string;
  type: string;
  singleImageIndex: number;
  imageDetails: MediaResponseDTO[];
  OpenCloseAddToAlbumSelected: () => void;
  isAddAlbumOpen: boolean;
  handleRefresh: (value: boolean) => void;
}
interface APIResponse {
  message: string;
  statusCode: number;
}

export default function AddToAlbum({
  mediaType,
  type,
  singleImageIndex,
  imageDetails,
  OpenCloseAddToAlbumSelected,
  isAddAlbumOpen,
  handleRefresh,
}: AddAlbumProbs) {
  // we get the user info mainly user albums names
  const { user } = useUser();

  // this handle API RESPONSE
  const [apiResponse, setApiResponse] = useState<APIResponse>({
    message: "",
    statusCode: 0,
  });

  // this get the selected album id
  const [albumID, setAlbumId] = useState<string | null>(null);
  const handleAlbumIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setAlbumId(e.target.id);
    } else {
      setAlbumId(null);
    }
  };

  const handleAddFileToAlbum = async (method: string) => {
    switch (type) {
      case "SINGLE":
        const response = await AddFileToAlbum(
          albumID! || imageDetails[singleImageIndex]._id,
          imageDetails[singleImageIndex]._id,
          method,
        );

        // we close the add to album once it added
        if (response.statusCode !== 201) {
          setApiResponse(response);
        }
        break;
      case "MANY":
        for (let index = 0; index < imageDetails.length; index++) {
          const response = await AddFileToAlbum(
            albumID! || imageDetails[index]._id,
            imageDetails[index]._id,
            method,
          );

          // we close the add to album once it added
          if (response.statusCode !== 201) {
            setApiResponse(response);
          }
        }
        break;
    }

    // later need to work on this update logic
    // we update the album counts..
    // this one adds the file
    /*

    setUser((prev) => {
      if (!prev) return prev;

      const targetID = albumID ?? imageDetails[0]?.fileAlbums;

      return {
        ...prev,
        photoAlbums: prev.photoAlbums.map((album) =>
          album._id?.toString() === targetID?.toString()
            ? {
                ...album,
                numberOfItems:
                  method === "add"
                    ? album.numberOfItems + imageDetails.length
                    : Math.max(0, album.numberOfItems - imageDetails.length),
              }
            : album,
        ),
      };
    });
    */

    OpenCloseAddToAlbumSelected();
    handleRefresh(true); // reload the page

    console.log(type);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isAddAlbumOpen ? `opacity-100 scale-100` : `opacity-0 scale-0`} transition-all duration-300`}
    >
      <div className="w-full max-w-md rounded-2xl bg-green-100 p-6 shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800">Add Image To Album</h2>

        {/* Albums */}
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-gray-700">Select Album</h3>

          <div className="max-h-60 space-y-3 overflow-y-auto">
            {user &&
              (mediaType === "Images"
                ? user.photoAlbums
                : user.videoAlbums
              ).map((album) => (
                <div
                  key={album._id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3
              cursor-pointer transition-all duration-200
              hover:shadow-md
              hover:-translate-y-0.5
            "
                >
                  {/* Album info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {album?.albumName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {album.numberOfItems > 1
                        ? `${album.numberOfItems} Files`
                        : `${album.numberOfItems} File`}
                    </p>
                  </div>

                  {/* Select */}
                  <input
                    id={album._id}
                    type="radio"
                    className="h-5 w-5 accent-green-600"
                    checked={
                      !albumID
                        ? imageDetails[0]?.fileAlbums == album._id
                        : albumID == album._id
                    }
                    onChange={handleAlbumIDChange}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={OpenCloseAddToAlbumSelected}
            className="
          rounded-lg bg-white px-5 py-2
          text-gray-700 shadow
          transition-all
          hover:bg-gray-50
          hover:shadow-lg
          active:scale-95
          cursor-pointer
        "
          >
            Cancel
          </button>

          <button
            onClick={() => handleAddFileToAlbum("clear")}
            className="
          rounded-lg bg-red-300 px-5 py-2
          text-white shadow
          transition-all
          hover:bg-red-500
          hover:shadow-lg
          active:scale-95
          cursor-pointer
        "
          >
            Clear
          </button>

          <button
            disabled={albumID ? false : true}
            onClick={() => handleAddFileToAlbum("add")}
            className={`
          rounded-lg ${albumID ? "bg-green-600" : "bg-gray-600"} px-5 py-2
          text-white shadow
          transition-all
         ${albumID && " hover:bg-green-700"}
          hover:shadow-lg
          hover:-translate-y-0.5
          active:scale-95
          cursor-pointer`}
          >
            Add
          </button>
        </div>

        {/* Print API Response  */}
        <div className="text-red-500 font-light">
          <label>
            {apiResponse?.statusCode == 502 ? apiResponse.message : ""}
          </label>
        </div>
      </div>
    </div>
  );
}

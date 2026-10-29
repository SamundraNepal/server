import { DeleteAndRestoreFiles } from "../services/media.data.service";
import { MediaResponseDTO } from "../types/files.types";

interface DeleteProps {
  type: string;
  mediaType: string;
  singleImageIndex: number;
  imageDetails: MediaResponseDTO[];
  onDeleteClose: () => void;
  isDelete: boolean;
  handleRefresh: (value: boolean) => void;
}

export default function DeleteFilesModel({
  mediaType,
  type,
  singleImageIndex,
  imageDetails,
  onDeleteClose,
  isDelete,
  handleRefresh,
}: DeleteProps) {
  const handleDeleteFiles = async () => {
    switch (type) {
      case "SINGLE":
        const response = await DeleteAndRestoreFiles(
          imageDetails[singleImageIndex]._id,
          mediaType === "Trash" ? "PDELETE" : "DELETE",
        );

        if (response?.code !== 201) {
          console.log("Sorry cant delete.");
        }
        break;
      case "MANY":
        for (let index = 0; index < imageDetails.length; index++) {
          const response = await DeleteAndRestoreFiles(
            imageDetails[index]._id,
            mediaType === "Trash" ? "PDELETE" : "DELETE",
          );

          if (response?.code !== 201) {
            console.log("Sorry cant delete.");
          }
        }

        break;
    }

    onDeleteClose();
    handleRefresh(true);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 z-50 ${isDelete ? "opacity-100 scale-100 " : `opacity-0 scale-0`} duration-200 transition-all`}
    >
      <div className="w-full max-w-md rounded-2xl bg-green-100 shadow-2xl p-2 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-800">Delete Item</h2>

        {mediaType !== "Trash" && (
          <p className="mt-3 text-gray-700">
            {mediaType === "Album" ? (
              <>
                Are you sure you want to remove{" "}
                {type === "MANY" && imageDetails.length > 1
                  ? `${imageDetails.length} items`
                  : "this item"}{" "}
                from the album? It will also remove the album from the file and
                can be restored from Trash.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                {type === "MANY" && imageDetails.length > 1
                  ? imageDetails.length
                  : "this"}{" "}
                item? You can restore it later from the Trash.
              </>
            )}
          </p>
        )}

        {mediaType === "Trash" && (
          <p className="mt-3 text-gray-700">
            Are you sure you want to delete{" "}
            {type === "MANY" && imageDetails.length > 1
              ? imageDetails.length
              : "this"}{" "}
            item permanently ?
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onDeleteClose}
            className="px-5 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleDeleteFiles}
            className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import { DeleteAndRestoreFiles } from "../services/media.data.service";
import { MediaResponseDTO } from "../types/files.types";

interface RestoreProps {
  type: string;
  mediaType: string;
  singleImageIndex: number;
  imageDetails: MediaResponseDTO[];
  onRestoreClose: () => void;
  isRestore: boolean;
  handleRefresh: (value: boolean) => void;
}

export default function RestoreFilesModel({
  mediaType,
  type,
  singleImageIndex,
  imageDetails,
  onRestoreClose,
  isRestore: isDelete,
  handleRefresh,
}: RestoreProps) {
  const handleRestoreFiles = async () => {
    switch (type) {
      case "SINGLE":
        const response = await DeleteAndRestoreFiles(
          imageDetails[singleImageIndex]._id,
          "RESTORE",
        );

        if (response?.code !== 201) {
          console.log("Sorry cant Restore.");
        }
        break;
      case "MANY":
        for (let index = 0; index < imageDetails.length; index++) {
          const response = await DeleteAndRestoreFiles(
            imageDetails[index]._id,
            "RESTORE",
          );

          if (response?.code !== 201) {
            console.log("Sorry cant Restore.");
          }
        }

        break;
    }

    onRestoreClose();
    handleRefresh(true);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 z-50 ${isDelete ? "opacity-100 scale-100 " : `opacity-0 scale-0`} duration-200 transition-all`}
    >
      <div className="w-full max-w-md rounded-2xl bg-green-100 shadow-2xl p-2 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-800">Restore Item</h2>

        {mediaType === "Trash" && (
          <p className="mt-3 text-gray-700">
            Are you sure you want to Restore{" "}
            {type === "MANY" && imageDetails.length > 1
              ? imageDetails.length
              : "this"}{" "}
            item permanently?
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onRestoreClose}
            className="px-5 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleRestoreFiles}
            className="px-5 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition cursor-pointer"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

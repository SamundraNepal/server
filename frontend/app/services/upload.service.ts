import { apiClient } from "../lib/api";
import { UploadFileDTO, UploadingFilesDTO } from "../types/files.types";
import axios from "axios";

export async function UploadImagesAPI({ file }: UploadFileDTO) {
  const chunkSizeMB = 2;
  const chunkSize = chunkSizeMB * 1024 * 1024;

  for (let index = 0; index < file.length; index++) {
    const currentFile = file[index];

    const fingerprint = `${currentFile.name}-${currentFile.size}-${currentFile.lastModified}`;

    const fileId = crypto.randomUUID();

    const totalChunks = Math.ceil(currentFile.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, currentFile.size);

      const chunk = currentFile.slice(start, end);

      const formData = new FormData();

      formData.append("fileSignature", fingerprint);
      formData.append("fileId", fileId);
      formData.append("fileName", currentFile.name);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("file", chunk);

      await apiClient("/user/uploadimage", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
    }
  }
}

export async function UploadImageAPIS(
  albumID: string | null,
  { file }: UploadFileDTO,
  uploadingFile: UploadingFilesDTO[],
  handleUploadProgress: (pfileId: string, rogress: number) => void,
  fileType: string,
) {
  const chunkSizeMB = 2;
  const chunkSize = chunkSizeMB * 1024 * 1024;
  const totalFile = file.length;
  let currentFileTrack = 0;

  for (let index = 0; index < file.length; index++) {
    currentFileTrack++;
    const currentFile = file[index];

    const fingerprint = `${currentFile.name}-${currentFile.size}-${currentFile.lastModified}`;

    const fileId = uploadingFile[index]?.id || crypto.randomUUID();

    const totalChunks = Math.ceil(currentFile.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, currentFile.size);

      const chunk = currentFile.slice(start, end);

      const formData = new FormData();

      formData.append("fileSignature", fingerprint);
      formData.append("fileSize", chunkSizeMB.toString());
      formData.append("fileId", fileId);
      formData.append("fileName", currentFile.name);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("TotalFile", totalFile.toString());
      formData.append("CurrentFileNumber", currentFileTrack.toString());
      formData.append("AlbumID", albumID!);
      formData.append("fileType", fileType);
      formData.append("file", chunk);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/user/uploadimage`,
        formData,
        {
          withCredentials: true,
          // Allow up to 10 minutes for this chunk request
          timeout: 600000,

          onUploadProgress: (event) => {
            if (!event.total) return;

            const completedBytes = chunkIndex * chunkSize;

            const totalUploaded = completedBytes + event.loaded;

            const progress = totalUploaded / currentFile.size;

            const progressInPercentages = Number(
              Math.min(progress * 100, 100).toFixed(1),
            );

            // this sends the progress back to the image main page
            handleUploadProgress(fileId, progressInPercentages);
          },
        },
      );

      if (response.data?.message === "Complete") {
        return response.data;
      }
    }
  }
}

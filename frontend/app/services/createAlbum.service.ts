import { apiClient } from "../lib/api";
import { AlbumsDTO } from "../types/files.types";

export const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_URL!;
    
// update password
export async function CreateAlbum(data: AlbumsDTO, mediaType: string) {
  console.log(mediaType);
  return await apiClient("/user/createAlbum", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, mediaType }),
  });
}

export async function SetAlbumPassword(
  albumID: string,
  password: string,
  confirmPassword: string,
) {
  return await apiClient("/album/createalbumpassword", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumID, password, confirmPassword }),
  });
}

export async function UnlockDeleteAlbumWithPassword(
  albumID: string,
  password: string,
  methodType: string,
  type: string,
) {
  return await apiClient("/album/unlockalbum", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumID, password, methodType, type }),
  });
}

export async function AddFileToAlbum(
  albumID: string,
  fileId: string,
  method: string,
) {
  return await apiClient("/album/addfiletoalbum", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumID, fileId, method }),
  });
}

export async function GetAlbumFiles(authToken: string, albumID: string) {
  const response = await fetch(`${API_URL}/album/getalbumfiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth_token=${authToken}`,
    },
    body: JSON.stringify({ albumID }),
  });

  return response.json();
}

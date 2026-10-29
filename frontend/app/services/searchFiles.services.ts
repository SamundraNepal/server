import { apiClient } from "../lib/api";

export async function GetSearchFilesNormal(
  searchText: string,
  mediaType: string,
  albumID: string,
  pageNumber: number,
  PageDataLimit: number,
) {
  return await apiClient(
    `/media/getsearchfiles?pageNumber=${pageNumber}&PageDataLimit=${PageDataLimit}&mediaType=${mediaType}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchText, mediaType, albumID }),
    },
  );
}

export async function GetInfiniteSearchFiles(
  searchText: string,
  mediaType: string,
  pageNumber: number,
  PageDataLimit: number,
  albumID: string,
) {
  return await apiClient(
    `/media/getsearchfiles?pageNumber=${pageNumber}&PageDataLimit=${PageDataLimit}&mediaType=${mediaType}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchText, mediaType, albumID }),
    },
  );
}

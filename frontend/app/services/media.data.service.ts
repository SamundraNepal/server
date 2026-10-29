import { apiClient } from "../lib/api";

export async function GetFiles(
  authToken: any,
  pageNumber: number,
  PageDataLimit: number,
  mediaType: string,
) {
  return apiClient(
    `/user/getfiles?pageNumber=${pageNumber}&PageDataLimit=${PageDataLimit}&mediaType=${mediaType}`,
    {
      method: "Get",
      headers: {
        Cookie: `auth_token=${authToken?.value}`,
      },
    },
  );
}

export async function GetVideosFiles(authToken: any) {
  return apiClient("/user/getvideos", {
    method: "GET",
    headers: {
      Cookie: `auth_token=${authToken?.value}`,
    },
  });
}

export async function GetTrashFiles(authToken: any) {
  return apiClient("/media/gettrashfiles", {
    method: "GET",
    headers: {
      Cookie: `auth_token=${authToken?.value}`,
    },
  });
}

export async function DeleteAndRestoreFiles(
  fileID: string,
  methodType: string,
) {
  return apiClient("/user/deleteandrestorefiles", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileID, methodType }),
  });
}

export async function InfiniteLoading(
  pageNumber: number,
  PageDataLimit: number,
  mediaType: string,
) {
  return apiClient(
    `/user/getfiles?pageNumber=${pageNumber}&PageDataLimit=${PageDataLimit}&mediaType=${mediaType}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
}

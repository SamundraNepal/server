import { apiClient } from "../lib/api";

interface User {
  _id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  imageLink: string;
  isUserActive: boolean;
  storage: number;
}

// to refetch user data
export async function UpdateUsers(users: User, isDelete: boolean) {
  return apiClient("/auth/updateUsers", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...users, isDelete }),
  });
}

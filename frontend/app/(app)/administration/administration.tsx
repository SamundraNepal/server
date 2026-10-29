"use client";

import { UpdateUsers } from "@/app/services/admin.services";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface User {
  _id: string;
  authProvider: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  imageLink: string;
  isUserActive: boolean;
  storage: number;
}

interface UserTableProps {
  users: User[];
}

interface APIResponseDTO {
  id: string;
  message: string;
  isError: boolean;
  code: number;
}

export default function AdministrationPage({
  users: initialUsers,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const router = useRouter();


  const [apiResponse, setApiResponse] = useState<APIResponseDTO>({
    id: "",
    isError: false,
    message: "",
    code: 0,
  });

  const updateUser = (
    id: string,
    field: keyof User,
    value: string | number | boolean,
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === id
          ? {
            ...user,
            [field]: value,
          }
          : user,
      ),
    );
  };

  const adminControl = async (data: User, isDelete: boolean = false) => {
    try {
      const response = await UpdateUsers(data, isDelete);

      if (response.code === 201) {
        router.refresh();
        setApiResponse({
          message: response.message,
          isError: false,
          id: response.id,
          code: 201,
        });
      } else {
        setApiResponse({
          message: response.message,
          isError: true,
          id: response.id,
          code: 502,
        });

        console.log(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto rounded-xl border border-gray-500 bg-white p-3 shadow-sm sm:p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <div
            key={user._id}
            className={`rounded-2xl border p-5 shadow-sm transition ${user.isUserActive
              ? "border-gray-200 bg-white hover:shadow-md"
              : "border-red-300 bg-red-50 hover:shadow-md"
              }`}
          >
            {/* ================= USER HEADER ================= */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={
                    user.authProvider === "google"
                      ? user.imageLink
                      : `${process.env.NEXT_PUBLIC_URL}/media/profileimage/${user.imageLink}?id=${user._id}`
                  }
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>

                  <p className="truncate text-sm text-gray-500">
                    {user.emailAddress}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${user.isUserActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {user.isUserActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* ================= DIVIDER ================= */}
            <div className="my-5 border-t border-gray-100" />

            {/* ================= STORAGE ================= */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Storage</p>

                <p className="text-xs text-gray-400">Maximum storage</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={user.storage}
                  onChange={(e) =>
                    updateUser(user._id, "storage", Number(e.target.value))
                  }
                  className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-right outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <span className="text-sm text-gray-500">GB</span>
              </div>
            </div>

            {/* ================= ACCOUNT STATUS ================= */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Account Status
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateUser(user._id, "isUserActive", !user.isUserActive)
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${user.isUserActive ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${user.isUserActive ? "left-6" : "left-1"
                      }`}
                  />
                </button>

                <span
                  className={`text-xs font-medium ${user.isUserActive ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {user.isUserActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* ================= ACCOUNT STATUS ================= */}
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Account Delete
                </p>
              </div>
            </div>

            {/* ================= USER ID ================= */}
            <div className="mt-5 rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-xs font-medium text-gray-400">User ID</p>

              <p className="break-all font-mono text-xs text-gray-500">
                {user._id}
              </p>
            </div>

            {apiResponse.id === user._id && (
              <div
                className={`mt-5 rounded-lg ${apiResponse.code != 201 ? " bg-red-500" : " bg-green-500"} p-3`}
              >
                <p className="break-all font-mono text-xs text-white">
                  {apiResponse.message}
                </p>
              </div>
            )}
            {/* ================= ACTION ================= */}
            <button
              onClick={() => adminControl(user)}
              className="mt-5 w-full cursor-pointer rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-200 hover:text-black"
            >
              Post
            </button>

            <button
              onClick={() => adminControl(user, true)}
              className="mt-5 w-full cursor-pointer rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-200 hover:text-black"
            >
              Delete Account
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

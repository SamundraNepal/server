"use client";

import UpdatePasswordModel from "@/app/components/updatePassword";
import { useUser } from "@/app/context/UserContext";
import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-emerald-50 px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        {/* Header */}
        <section>
          <div className="mb-3 inline-flex rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-700">
            Account Settings
          </div>

          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            Manage Your Account
          </h1>

          <p className="mt-2 max-w-xl text-gray-500">
            Update your profile, security settings, and account preferences.
          </p>
        </section>

        {/* Profile */}
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/40">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="rounded-full bg-gradient-to-br from-lime-300 to-emerald-400 p-1 shadow-lg">
              {user?.imageLink ? (
                <Image
                  src={
                    user.authProvider === "google"
                      ? user.imageLink
                      : `${process.env.NEXT_PUBLIC_URL}/media/profileimage/${user.imageLink}`
                  }
                  width={140}
                  height={140}
                  alt="User profile"
                  className="rounded-full border-4 border-white object-cover"
                  unoptimized
                />
              ) : (
                <User size={80} />
              )}
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-lime-600">
                Profile Picture
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a picture that represents you.
              </p>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40">
          <div className="border-b border-gray-100 px-8 py-6">
            <h2 className="text-xl font-bold text-gray-900">
              Account & Security
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your account and keep it secure.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Update Picture */}

            {user?.authProvider != "google" && <UpdateProfilePicture />}

            {/*Update Password */}
            {user?.authProvider != "google" && <UpdatePassword />}

            {/* Deactivate */}
            <DeactivateAccount />
          </div>
        </section>

        <p className="pb-6 text-center text-sm text-gray-400">
          Manage your account securely and keep your memories protected.
        </p>
      </div>
    </main>
  );
}

function UpdateProfilePicture() {
  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-lime-50"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-xl">
          📷
        </div>

        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-lime-600">
            Update Picture
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Change your profile picture.
          </p>
        </div>
      </div>

      <span className="text-2xl text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-lime-500">
        →
      </span>
    </button>
  );
}

function UpdatePassword() {
  const [updatePasswordClick, setUpdatePasswordClick] =
    useState<boolean>(false);

  const handleOpenAndClosePassword = () => {
    setUpdatePasswordClick((prev) => !prev);
  };

  return (
    <div>
      {updatePasswordClick && (
        <UpdatePasswordModel handleOpenAndClose={handleOpenAndClosePassword} />
      )}
      <button
        onClick={handleOpenAndClosePassword}
        type="button"
        className="group flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-lime-50"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-100 text-xl">
            🔒
          </div>

          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-lime-600">
              Update Password
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Change your account password.
            </p>
          </div>
        </div>

        <span className="text-2xl text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-lime-500">
          →
        </span>
      </button>
    </div>
  );
}

function DeactivateAccount() {
  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-red-50"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl">
          ⚠️
        </div>

        <div>
          <h3 className="font-bold text-red-600">Deactivate Account</h3>

          <p className="mt-1 text-sm text-gray-500">
            Temporarily disable your account.
          </p>
        </div>
      </div>

      <span className="text-2xl text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-red-500">
        →
      </span>
    </button>
  );
}

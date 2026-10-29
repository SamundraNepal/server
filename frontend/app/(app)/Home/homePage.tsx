"use client";
import FolderCards from "@/app/components/folderCards";
import Image from "next/image";
import LogOut from "./logout/logout";
import { useUser } from "@/app/context/UserContext";
import { User } from "lucide-react";
import DisplayStorage from "@/app/components/display_storage";

export default function HomePage() {
  const { user } = useUser(); // holds user data from context api


  return (
    <main className="min-h-screen w-full bg-linear-to-br from-lime-50 via-white to-emerald-50 p-6 sm:px-10 lg:px-16 fancy-scrollbar">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        {/* Header */}
        <section className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-700">
            ✨ Your Personal Memories
          </div>

          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Your Journey,
            <span className="block text-lime-500">Captured in Memories.</span>
          </h1>

          <p className="max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Keep your photos, videos, and important memories organized in one
            beautiful and secure place.
          </p>
        </section>

        {/* Folders */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Library</h2>
              <p className="mt-1 text-sm text-gray-500">
                Everything you have stored.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {/*we pass data to these cards so that we can avoid using use effects*/}
            {user?.isAdmin && (
              <FolderCards type={4} folderName="administration" />
            )}
            <FolderCards type={0} folderName="images" />
            <FolderCards type={1} folderName="videos" />
            <FolderCards type={2} folderName="trash" />
            <FolderCards type={3} folderName="settings" />
          </div>
        </section>

        {/* Profile / Account */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 sm:p-8">
          <DisplayStorage
            totalConsumeSize={user?.userStorageComsumeSize ?? 0}
            currentSizeInGB={user?.strorage ?? 0}
          />

          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="rounded-full bg-linear-to-br from-lime-300 to-emerald-400 p-1 shadow-lg">
                {user?.imageLink ? (

                  <Image
                    src={
                      user?.authProvider === "google"
                        ? user.imageLink
                        : `${process.env.NEXT_PUBLIC_URL}/media/profileimage/${user.imageLink}`
                    }
                    width={110}
                    height={110}
                    alt="User profile"
                    className="aspect-square rounded-full border-4 border-white object-cover overflow-hidden"
                    unoptimized
                  />

                ) : (
                  <User size={88} />
                )}
              </div>

              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-lime-600">
                  Welcome back
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your memories and account settings.
                </p>
              </div>
            </div>

            <LogOut />
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-4 text-center text-sm text-gray-400">
          Your memories. Your journey. Your story.
        </footer>
      </div>
    </main>
  );
}

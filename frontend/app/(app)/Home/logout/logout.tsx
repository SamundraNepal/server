"use client";

import { LogoutUser } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";

export default function LogOut() {
  const router = useRouter();

  const handleLogOut = async () => {
    const response = await LogoutUser();

    if (response.code == 201) {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogOut}
      type="button"
      className="cursor-pointer rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl active:translate-y-0"
    >
      Log Out
    </button>
  );
}

"use client";
import { SingUpData } from "@/app/types/auth.types";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  GeneratePasswordResetLink,
  SignUpAPI,
} from "@/app/services/auth.service";

interface Response {
  message: string;
  code: number;
}

interface ResetEmail {
  emailAddress: string;
}
export default function PasswordReset() {
  // signup data
  const [resetEmail, setResetEmail] = useState<ResetEmail>({
    emailAddress: "",
  });

  const [responseMessage, setResponseMessage] = useState<Response>({
    message: "",
    code: 0,
  });

  // handles the form value change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setResetEmail({ emailAddress: value });
  };

  // handle form submit
  const handleFormSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    // 1st prevet relload at each submission
    e.preventDefault();

    // 2nd pass it to the singUp API
    const responseResult = await GeneratePasswordResetLink(resetEmail);
    setResponseMessage(responseResult);
  };

  return (
    <div className="min-h-screen w-full bg-green-100 flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <form
          onSubmit={handleFormSubmit}
          className="w-full max-w-md rounded-2xl bg-green-50 p-6 shadow-xl"
        >
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Forgot Password
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter your email address and we'll send you a reset password link
            </p>
          </div>

          {/* Email */}
          <h3 className="mb-2 font-semibold text-gray-700">Email Address</h3>

          <input
            value={resetEmail.emailAddress}
            onChange={handleFileChange}
            type="email"
            id="email"
            required
            placeholder="Enter your email"
            className="
          w-full
          rounded-lg
          border border-green-200
          bg-white
          px-4 py-3
          text-gray-800
          outline-none
          transition-all
          focus:border-green-500
          focus:ring-2
          focus:ring-green-100
        "
          />

          {/*Error Message here*/}
          {responseMessage.message && (
            <label
              className={`${responseMessage.code == 201 ? `text-green-400` : "text-red-600"} font-bold`}
            >
              {responseMessage.message}
            </label>
          )}

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 text-center">
            <Link
              href={"/"}
              className="
          cursor-pointer
          rounded-lg
          bg-white
          px-5 py-2
          text-black
          shadow
          transition-all
          hover:bg-grey-200
          hover:shadow-lg
          hover:-translate-y-0.5
          active:scale-95
        "
            >
              Cancel
            </Link>

            <button
              className="
          cursor-pointer
          rounded-lg
          bg-green-600
          px-5 py-2
          text-white
          shadow
          transition-all
          hover:bg-green-700
          hover:shadow-lg
          hover:-translate-y-0.5
          active:scale-95
        "
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuccessModal() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[90%] max-w-md rounded-xl bg-green-100 p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <CheckCircle size={52} className="mb-4 text-green-700" />

          <h2 className="text-xl font-semibold text-green-900">
            Account Created
          </h2>

          <p className="mt-2 text-green-800">
            Your account has been successfully created.
          </p>

          <p className="mt-4 text-sm text-green-700">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}

"use client";
import {
  ChnageResetPasswordDTO,
  ResetPasswordDTO,
  SingUpData,
} from "@/app/types/auth.types";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeResetPassword,
  GeneratePasswordResetLink,
  SignUpAPI,
} from "@/app/services/auth.service";
import Image from "next/image";

interface Response {
  message: string;
  code: number;
}

type ResetPasswordProps = {
  data: ResetPasswordDTO;
};

export default function ResetPassword({ data }: ResetPasswordProps) {
  const router = useRouter();

  const [resetPassword, setResetPassword] = useState<ChnageResetPasswordDTO>({
    emailAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [responseMessage, setResponseMessage] = useState<Response>({
    message: "",
    code: 0,
  });

  // password check before hand
  const isLongEnough = resetPassword.password.length > 6;
  const hasUpperCase = /[A-Z]/.test(resetPassword.password);
  const hasLowerCase = /[a-z]/.test(resetPassword.password);
  const hasNumber = /[0-9]/.test(resetPassword.password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(resetPassword.password);
  const isMatch = resetPassword.password == resetPassword.confirmPassword;

  const isPasswordValid =
    isLongEnough &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isMatch;

  // handles the form value change
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setResetPassword((prev) => ({
      ...prev,
      emailAddress: data.emailAddress,
    }));
    setResetPassword((prev) => ({ ...prev, [id]: value }));
  };

  // handle form submit
  const handleFormSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    // 1st prevet relload at each submission
    e.preventDefault();

    // if password is not filled properly we not submit the form
    if (!isPasswordValid) return;

    // 2nd pass it to the Change password API
    const response = await ChangeResetPassword(resetPassword);
    if (response.code == 201) {
      router.push("/");
    }
    setResponseMessage(response);
  };

  return (
    <div className="min-h-screen w-full bg-green-100 flex items-center justify-center px-4 py-8">
      <div className="min-h-screen flex items-center justify-center bg-green-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          {/* User */}
          <div className="flex flex-col items-center mb-8">
            <Image
            height={200}
            width={200}
              src={data.imageLink}
              alt="User"
              className="w-20 h-20 rounded-full object-cover border-4 border-green-200"
            />

            <h1 className="mt-4 text-xl font-semibold text-green-900">
              {data.firstName.toUpperCase()}
            </h1>

            <p className="text-sm text-green-700 mt-1">{data.emailAddress}</p>

            <p className="text-sm text-green-600 mt-4 text-center">
              Reset your password for this account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">
                New Password
              </label>

              <input
                required
                value={resetPassword.password}
                onChange={handleValueChange}
                id="password"
                type="password"
                name="password"
                placeholder="Enter new password"
                className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200"
              />

              {resetPassword.password.length > 0 && (
                <div className="flex flex-col gap-1 text-xs text-red-500">
                  {!isLongEnough && (
                    <span>Password must be more than 6 characters long.</span>
                  )}
                  {!hasUpperCase && (
                    <span>Password must contain an uppercase letter.</span>
                  )}
                  {!hasLowerCase && (
                    <span>Password must contain a lowercase letter.</span>
                  )}
                  {!hasNumber && <span>Password must contain a number.</span>}
                  {!hasSpecialChar && (
                    <span>Password must contain a special character.</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">
                Confirm Password
              </label>

              <input
                required
                value={resetPassword.confirmPassword}
                onChange={handleValueChange}
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200"
              />

              {resetPassword.confirmPassword.length > 0 && !isMatch && (
                <span className="text-xs text-red-500">
                  Passwords do not match.
                </span>
              )}
            </div>

            {responseMessage.message && (
              <label
                className={`${responseMessage.code == 201 ? `text-green-400` : "text-red-600"} font-bold`}
              >
                {responseMessage.message}
              </label>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-200 py-3.5 font-semibold text-green-900 hover:bg-green-300 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
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

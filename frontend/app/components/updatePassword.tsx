"use client";

import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { UpdatePasswordDTO } from "../types/auth.types";
import { UpdatePassword } from "../services/auth.service";
import { useRouter } from "next/navigation";

interface UpdatePasswordProps {
  handleOpenAndClose: () => void;
}

export default function UpdatePasswordModel({
  handleOpenAndClose,
}: UpdatePasswordProps) {
  const [password, setPassword] = useState<UpdatePasswordDTO>({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const [apiResponse, setApiResponse] = useState();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  // Password validation
  const isLongEnough = password.newPassword.length > 6;
  const hasUpperCase = /[A-Z]/.test(password.newPassword);
  const hasLowerCase = /[a-z]/.test(password.newPassword);
  const hasNumber = /[0-9]/.test(password.newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password.newPassword);
  const isMatch = password.newPassword === password.confirmPassword;

  const isPasswordValid =
    isLongEnough &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isMatch;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPasswordValid) return;

    if (password.newPassword !== password.confirmPassword) {
      return;
    }

    const response = await UpdatePassword(password);

    console.log(response);
    if (response.code === 201) {
      router.push("/");
    }

    setApiResponse(response.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-green-100 bg-white/95 p-6 shadow-2xl shadow-green-900/20">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-green-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-green-700/70">
                  Update your password to keep your account secure.
                </p>
              </div>

              <button
                onClick={handleOpenAndClose}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-green-700 transition hover:bg-green-100 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label
                htmlFor="oldPassword"
                className="mb-1.5 block text-sm font-medium text-green-800"
              >
                Current Password
              </label>

              <input
                id="previousPassword"
                type="password"
                name="previousPassword"
                placeholder="Enter your current password"
                value={password.previousPassword}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-white bg-white/80 p-2.5 text-green-900 shadow-md outline-none transition placeholder:text-green-900/40 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-green-800"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="Enter your new password"
                value={password.newPassword}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-white bg-white/80 p-2.5 text-green-900 shadow-md outline-none transition placeholder:text-green-900/40 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              />

              {/* Password requirements */}
              {password.newPassword.length > 0 && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="mb-2 text-xs font-semibold text-green-800">
                    Password requirements
                  </p>

                  <div className="grid grid-cols-1 gap-1">
                    <PasswordRequirement
                      valid={isLongEnough}
                      text="More than 6 characters"
                    />

                    <PasswordRequirement
                      valid={hasUpperCase}
                      text="One uppercase letter"
                    />

                    <PasswordRequirement
                      valid={hasLowerCase}
                      text="One lowercase letter"
                    />

                    <PasswordRequirement valid={hasNumber} text="One number" />

                    <PasswordRequirement
                      valid={hasSpecialChar}
                      text="One special character"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-green-800"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={password.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-white bg-white/80 p-2.5 text-green-900 shadow-md outline-none transition placeholder:text-green-900/40 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              />

              {password.confirmPassword.length > 0 && (
                <p
                  className={`mt-1.5 text-xs font-medium ${
                    isMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isMatch ? "Passwords match." : "Passwords do not match."}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3 pt-2">
              <button
                onClick={handleOpenAndClose}
                type="button"
                className="flex-1 rounded-xl border-2 border-green-100 bg-white p-2.5 font-semibold text-green-700 shadow-md transition hover:bg-green-50 hover:text-green-900 active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className={`flex-1 rounded-xl p-2.5 font-semibold text-white shadow-lg transition active:scale-[0.98] ${
                  isPasswordValid
                    ? "bg-lime-500 shadow-green-500/30 hover:bg-lime-400 hover:shadow-green-500/40"
                    : "cursor-not-allowed bg-gray-400 shadow-none opacity-60"
                }`}
              >
                Update Password
              </button>
            </div>

            {apiResponse && (
              <p className={`mt-1.5 text-xs font-medium ${"text-red-500"}`}>
                {apiResponse}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid ? "text-green-600" : "text-gray-500"
      }`}
    >
      {valid ? (
        <CheckCircle className="h-3.5 w-3.5" />
      ) : (
        <Circle className="h-3.5 w-3.5" />
      )}

      <span>{text}</span>
    </div>
  );
}

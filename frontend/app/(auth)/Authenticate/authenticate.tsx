"use client";

import { VerificationCode } from "@/app/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface Response {
  message: string;
  code: number;
}

export default function UserAuthenticate() {
  const [authCode, setAuthCode] = useState({
    verificationToken: "",
    authCode: "",
  });

  const [tryCount, setTryCount] = useState({
    numberOfTry: 3,
  });

  const [responseMessage, setResponseMessage] = useState<Response>({
    message: "",
    code: 0,
  });

  const [loading, setLoading] = useState(false);

  const paramsID = useSearchParams();
  const userId = paramsID.get("verificationToken");

  const router = useRouter();

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const cleanedValue = value.replace(/\D/g, "").slice(0, 6);

    setAuthCode((prev) => ({
      ...prev,
      [id]: cleanedValue,
    }));

    if (responseMessage.message) {
      setResponseMessage({
        message: "",
        code: 0,
      });
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authCode.authCode.length !== 6) {
      setResponseMessage({
        message: "Please enter the 6-digit verification code.",
        code: 400,
      });

      return;
    }

    if (tryCount.numberOfTry <= 0) {
      return;
    }

    setLoading(true);

    try {
      const verificationResponse = await VerificationCode({
        verificationToken: userId ?? "",
        authCode: authCode.authCode,
      });

      setResponseMessage(verificationResponse);

      // Successful verification
      if (verificationResponse.code === 201) {
        router.push("/Home");
        return;
      }

      // Incorrect code
      setTryCount((prev) => {
        const remainingAttempts = Math.max(0, prev.numberOfTry - 1);

        // No attempts remaining
        if (remainingAttempts === 0) {
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }

        return {
          ...prev,
          numberOfTry: remainingAttempts,
        };
      });
    } catch (error) {
      setResponseMessage({
        message: "Something went wrong. Please try again.",
        code: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  const attemptsRemaining = tryCount.numberOfTry;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-lime-50 via-white to-emerald-50 px-5 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-500" />

          <div className="p-8 sm:p-10">
            {/* Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-50 text-4xl shadow-inner ring-8 ring-lime-50/50">
              ✉️
            </div>

            {/* Heading */}
            <div className="mt-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-600">
                Account Security
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                Verify Your Email
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                We sent a six-digit verification code to your email. Enter it
                below to verify your account.
              </p>
            </div>

            {/* Attempts */}
            <div
              className={`mt-7 flex items-center justify-between rounded-2xl border px-4 py-3 ${
                attemptsRemaining === 1
                  ? "border-red-100 bg-red-50"
                  : "border-lime-100 bg-lime-50"
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    attemptsRemaining === 1 ? "text-red-500" : "text-lime-600"
                  }`}
                >
                  Verification Attempts
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {attemptsRemaining === 1
                    ? "Last attempt remaining"
                    : "Attempts available"}
                </p>
              </div>

              <div
                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-lg font-black ${
                  attemptsRemaining === 1
                    ? "bg-red-100 text-red-600"
                    : "bg-lime-100 text-lime-700"
                }`}
              >
                {attemptsRemaining}
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleFormSubmit}
              className="mt-7 flex flex-col gap-5"
            >
              <div>
                <label
                  htmlFor="authCode"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Verification Code
                </label>

                <input
                  id="authCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  disabled={loading || attemptsRemaining === 0}
                  placeholder="000000"
                  onChange={handleValueChange}
                  value={authCode.authCode}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-center text-3xl font-black tracking-[0.45em] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-100 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-center text-xs text-gray-400">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Response */}
              {responseMessage.message && (
                <div
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
                    responseMessage.code === 201
                      ? "bg-lime-50 text-lime-700 ring-1 ring-lime-100"
                      : "bg-red-50 text-red-600 ring-1 ring-red-100"
                  }`}
                >
                  <span>{responseMessage.code === 201 ? "✓" : "!"}</span>

                  <span>{responseMessage.message}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || attemptsRemaining === 0}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-500 px-5 py-4 font-bold text-white shadow-lg shadow-lime-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-600 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </>
                ) : attemptsRemaining === 0 ? (
                  "No Attempts Remaining"
                ) : (
                  <>
                    Verify Account
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs leading-5 text-gray-400">
                Didn't receive the code? Check your spam or junk folder.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Your account security is important to us.
        </p>
      </div>
    </main>
  );
}

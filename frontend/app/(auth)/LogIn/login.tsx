"use client";

import GoogleButton from "@/app/components/googleButton";
import { LogInAPI } from "@/app/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, SyntheticEvent, useState } from "react";

interface Response {
  message: string;
  code: number;
}

export default function LogIn() {
  const [logInData, setLogInData] = useState({
    emailAddress: "",
    password: "",
  });

  const [responseMessage, setResponseMessage] = useState<Response>({
    message: "",
    code: 0,
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setLogInData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (responseMessage.message) {
      setResponseMessage({
        message: "",
        code: 0,
      });
    }
  };

  const handleFormSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const logInResponse = await LogInAPI(logInData);

      setResponseMessage(logInResponse);

      // Login successful → redirect to verification
      if (logInResponse.code === 201) {
        router.push(`/Authenticate?verificationToken=${logInResponse.id}`);
      } else if (logInResponse.code == 404) {
        router.push("/awaitingApprovalPage");
      }
    } catch (error) {
      setResponseMessage({
        message: "Something went wrong. Please try again.",
        code: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex w-full max-w-sm flex-col items-center justify-center gap-4"
    >
      {/* Email */}
      <div className="w-full">
        <label
          htmlFor="emailAddress"
          className="mb-1.5 block text-sm font-medium text-green-800"
        >
          Email
        </label>

        <input
          className="w-full rounded-xl border-2 border-white bg-white/80 p-2 text-green-900 shadow-md outline-none transition placeholder:text-green-900/40 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
          type="email"
          required
          placeholder="Enter Email"
          id="emailAddress"
          value={logInData.emailAddress}
          onChange={handleValueChange}
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div className="w-full">
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-green-800"
        >
          Password
        </label>

        <input
          className="w-full rounded-xl border-2 border-white bg-white/80 p-2 text-green-900 shadow-md outline-none transition placeholder:text-green-900/40 focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
          type="password"
          required
          placeholder="Enter Password"
          id="password"
          value={logInData.password}
          onChange={handleValueChange}
          disabled={loading}
        />
      </div>

      {/* Forgot Password */}
      <div className="flex w-full justify-end">
        <Link
          href="/passwordReset"
          className="text-sm font-medium text-green-700 transition hover:text-lime-600"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-lime-500 p-2.5 font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-lime-400 hover:shadow-green-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging In..." : "Log In"}
      </button>

      {/* Response */}
      {responseMessage.message && (
        <div
          className={`w-full rounded-xl p-2 text-center text-sm font-semibold ${
            responseMessage.code === 201
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {responseMessage.message}
        </div>
      )}

      {/* Other login methods */}
      <div className="flex w-full flex-col gap-4">
        {/* OR */}
        <div className="flex w-full items-center justify-center gap-3">
          <div className="flex-1 border-t border-green-200" />

          <span className="text-xs font-semibold text-green-500">OR</span>

          <div className="flex-1 border-t border-green-200" />
        </div>

        {/* Google Login */}
        <GoogleButton />
      </div>

      {/* Register */}
      <p className="mt-2 text-sm text-green-800">
        Don't have an account?{" "}
        <Link
          href="/SignUp"
          className="font-semibold text-lime-600 transition hover:text-lime-500"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

"use client";

import { SignUpAPI } from "@/app/services/auth.service";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Response {
  message: string;
  code: number;
}

export default function SignUpPage() {
  const [singUpForm, setSignUpForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
    image: null as File | null,
  });

  const [responseMessage, setResponseMessage] = useState<Response>({
    message: "",
    code: 0,
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, files } = e.target;

    setSignUpForm((prev) => ({
      ...prev,
      [id]: files ? files[0] : value,
    }));

    // Clear previous response
    if (responseMessage.message) {
      setResponseMessage({
        message: "",
        code: 0,
      });
    }
  };

  // Password validation
  const isLongEnough = singUpForm.password.length > 6;
  const hasUpperCase = /[A-Z]/.test(singUpForm.password);
  const hasLowerCase = /[a-z]/.test(singUpForm.password);
  const hasNumber = /[0-9]/.test(singUpForm.password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(singUpForm.password);
  const isMatch = singUpForm.password === singUpForm.confirmPassword;

  const isPasswordValid =
    isLongEnough &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isMatch;

  // Submit form
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setResponseMessage({
        message: "Please make sure your password meets all requirements.",
        code: 400,
      });

      return;
    }

    if (!singUpForm.image) {
      setResponseMessage({
        message: "Please select a profile picture.",
        code: 400,
      });

      return;
    }

    setLoading(true);

    try {
      const responseResult = await SignUpAPI(singUpForm);

      setResponseMessage(responseResult);
    } catch (error) {
      setResponseMessage({
        message: "Something went wrong. Please try again.",
        code: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show success screen
  if (responseMessage.code === 201) {
    return <SuccessModal />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-green-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-900">Create Account</h1>

          <p className="mt-2 text-sm text-green-700">
            Create your account and start saving your memories.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4 rounded-2xl bg-green-100 p-6 shadow-2xl shadow-black/20 md:p-10"
        >
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              First Name
            </label>

            <input
              id="firstName"
              type="text"
              required
              placeholder="Enter First Name"
              value={singUpForm.firstName}
              onChange={handleFileChange}
              disabled={loading}
              className="w-full rounded-xl border border-green-200 bg-white p-3 font-medium text-green-900 outline-none transition placeholder:text-green-900/40 focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:opacity-60"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              Last Name
            </label>

            <input
              id="lastName"
              type="text"
              required
              placeholder="Enter Last Name"
              value={singUpForm.lastName}
              onChange={handleFileChange}
              disabled={loading}
              className="w-full rounded-xl border border-green-200 bg-white p-3 font-medium text-green-900 outline-none transition placeholder:text-green-900/40 focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="emailAddress"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              Email
            </label>

            <input
              id="emailAddress"
              type="email"
              required
              placeholder="Enter Email"
              value={singUpForm.emailAddress}
              onChange={handleFileChange}
              disabled={loading}
              className="w-full rounded-xl border border-green-200 bg-white p-3 font-medium text-green-900 outline-none transition placeholder:text-green-900/40 focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              placeholder="Enter Password"
              value={singUpForm.password}
              onChange={handleFileChange}
              disabled={loading}
              className="w-full rounded-xl border border-green-200 bg-white p-3 font-medium text-green-900 outline-none transition placeholder:text-green-900/40 focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:opacity-60"
            />
          </div>

            {/* Password requirements */}
            {singUpForm.password.length > 0 && (
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              value={singUpForm.confirmPassword}
              onChange={handleFileChange}
              disabled={loading}
              className={`w-full rounded-xl border bg-white p-3 font-medium text-green-900 outline-none transition placeholder:text-green-900/40 focus:ring-2 disabled:opacity-60 ${
                singUpForm.confirmPassword.length > 0
                  ? isMatch
                    ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                    : "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-green-200 focus:border-green-400 focus:ring-green-200"
              }`}
            />

            {singUpForm.confirmPassword.length > 0 && (
              <p
                className={`mt-1.5 text-xs font-medium ${
                  isMatch ? "text-green-600" : "text-red-500"
                }`}
              >
                {isMatch ? "Passwords match." : "Passwords do not match."}
              </p>
            )}
          </div>

          {/* Profile Picture */}
          <div>
            <label
              htmlFor="image"
              className="mb-1.5 block text-sm font-medium text-green-800"
            >
              Profile Picture
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              disabled={loading}
              className="w-full rounded-xl border border-green-200 bg-white p-2.5 text-sm text-green-900 file:mr-4 file:rounded-lg file:border-0 file:bg-green-200 file:px-4 file:py-2 file:font-medium file:text-green-900 transition hover:file:bg-green-300 disabled:opacity-60"
            />
          </div>

          {/* Response */}
          {responseMessage.message && (
            <div
              className={`rounded-xl p-3 text-center text-sm font-semibold ${
                responseMessage.code === 201
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {responseMessage.message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-200 p-3 font-semibold text-green-900 shadow-sm transition hover:bg-green-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Back */}
          <Link
            href="/"
            className="rounded-xl border border-green-300 bg-white/50 p-3 text-center font-medium text-green-800 transition hover:bg-green-100"
          >
            Back to Login
          </Link>

          {/* Login */}
          <p className="text-center text-sm text-green-800">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-lime-600 transition hover:text-lime-500"
            >
              Log In
            </Link>
          </p>
        </form>
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

function SuccessModal() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-green-100 p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-200">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-green-900">
          Account Created!
        </h2>

        <p className="mt-2 text-sm leading-6 text-green-800">
          Your account has been successfully created.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-xl bg-green-200 p-3 font-semibold text-green-900 transition hover:bg-green-300"
        >
          Continue
        </button>

        <p className="mt-3 text-xs text-green-700">
          You will be redirected shortly.
        </p>
      </div>
    </div>
  );
}

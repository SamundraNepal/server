"use client";

import Link from "next/link";

export default function AwaitingApprovalPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50 px-4 py-10">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-green-300/20 blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_25px_70px_-20px_rgba(22,101,52,0.25)] backdrop-blur-xl">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-lime-400 to-emerald-400" />

          <div className="p-8 sm:p-10">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Pulse */}
                <div className="absolute inset-0 animate-ping rounded-full bg-lime-300/40" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-lime-100 to-green-100 shadow-inner">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-8 w-8 text-lime-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2"
                      />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-7 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                <span className="text-xs font-bold uppercase tracking-wide text-green-700">
                  Pending Review
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-green-950">
                Your Account Is Almost Ready
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-green-700/70">
                Your account has been successfully created. An administrator
                needs to review and approve your account before you can access
                the application.
              </p>
            </div>

            {/* Progress */}
            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-900">
                  Account Approval
                </span>

                <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-700">
                  Pending
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-green-100">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-green-500 to-lime-400" />
              </div>

              <div className="mt-3 flex justify-between text-xs text-green-600">
                <span>Account Created</span>
                <span>Admin Approval</span>
                <span>Access</span>
              </div>
            </div>

            {/* Information */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-green-100 bg-white p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h3 className="text-sm font-semibold text-green-900">
                  Account Created
                </h3>

                <p className="mt-1 text-xs leading-5 text-green-700/60">
                  Your registration was completed successfully.
                </p>
              </div>

              <div className="rounded-2xl border border-lime-100 bg-lime-50/50 p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-lime-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5 text-lime-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>

                <h3 className="text-sm font-semibold text-green-900">
                  Waiting for Review
                </h3>

                <p className="mt-1 text-xs leading-5 text-green-700/60">
                  An administrator will review your account.
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="mt-5 flex gap-3 rounded-2xl border border-green-100 bg-green-50/50 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
              </div>

              <p className="text-xs leading-5 text-green-700">
                You can safely close this page. Once your account is approved,
                simply return and sign in again to continue.
              </p>
            </div>

            {/* Button */}
            <Link
              href="/"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-green-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:from-lime-400 hover:to-green-400 hover:shadow-green-500/35 active:scale-[0.98]"
            >
              Back to Login
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-green-700/50">
          Your account is secure and waiting for administrator approval.
        </p>
      </div>
    </main>
  );
}

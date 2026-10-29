"use client";

export default function GoogleButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_URL}/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-3 w-full border rounded-lg py-3 cursor-pointer hover:bg-white"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.78-.07-1.54-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.39z"
        />
        <path
          fill="#34A853"
          d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.5A9.75 9.75 0 0 0 12 21.75z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.27.31-1.85v-2.5H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.35l3.25-2.5z"
        />
        <path
          fill="#EA4335"
          d="M12 6.12c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.4l3.25 2.5C7.31 7.84 9.46 6.12 12 6.12z"
        />
      </svg>

      <span>Continue with Google</span>
    </button>
  );
}

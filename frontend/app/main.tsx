import AwaitingApprovalPage from "./(auth)/awaitingApprovalPage/awaitingApprovalPage";
import LogInPage from "./(auth)/LogIn/page";
export default function MainPage() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="shadow-2xl rounded-2xl bg-green-100 p-6 sm:p-8 md:p-12 flex flex-col gap-8">
          <h1 className="text-2xl font-medium uppercase text-green-900 text-center">
            Log In
          </h1>
          <LogInPage />
        </div>
      </div>
    </div>
  );
}

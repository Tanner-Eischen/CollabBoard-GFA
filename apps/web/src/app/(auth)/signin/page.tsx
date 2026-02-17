import { SignInButton } from "@/components/auth/SignInButton";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sign in to CollabBoard
        </h1>
        <SignInButton />
      </div>
    </main>
  );
}

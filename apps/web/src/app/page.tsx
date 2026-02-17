import { SignInButton } from "@/components/auth/SignInButton";
import { Header } from "../components/layout/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-gray-50">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900">CollabBoard</h1>
          <p className="text-lg text-gray-600">
            Real-time collaborative whiteboarding for teams.
          </p>
          <SignInButton />
        </div>
      </main>
    </>
  );
}

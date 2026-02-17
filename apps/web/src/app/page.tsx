import { Header } from "@/components/layout/Header";
import { SignInButton } from "@/components/auth/SignInButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900">CollabBoard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Collaborative whiteboard for teams
        </p>
        <div className="mt-8 flex gap-4">
          <SignInButton />
        </div>
      </main>
    </div>
  );
}

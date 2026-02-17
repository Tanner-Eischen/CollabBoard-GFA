import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/authOptions";
import { Header } from "@/components/layout/Header";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Signed in as {session.user?.email ?? session.user?.name}
        </p>
        <p className="mt-1 text-sm text-gray-500">User ID: {session.user?.id}</p>
      </main>
    </div>
  );
}

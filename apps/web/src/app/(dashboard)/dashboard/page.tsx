import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getE2ESession } from "@/lib/auth/e2eSession";

export default async function DashboardPage() {
  const session = (await getE2ESession()) ?? (await getServerSession(authOptions));

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Signed in as {session.user?.email ?? session.user?.name}
        </p>
        <p className="text-sm text-gray-500">User ID: {session.user?.id}</p>
      </div>
    </main>
  );
}

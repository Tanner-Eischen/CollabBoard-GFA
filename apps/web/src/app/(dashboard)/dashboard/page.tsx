import { redirect } from "next/navigation";
import { getE2ESession } from "@/lib/auth/e2eSession";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const isE2EMode = process.env.E2E_AUTH_ENABLED === "true";
  const session = isE2EMode
    ? await getE2ESession()
    : await (async () => {
        const [{ getServerSession }, { authOptions }] = await Promise.all([
          import("next-auth"),
          import("@/lib/auth/authOptions"),
        ]);
        return getServerSession(authOptions);
      })();

  if (!session) {
    redirect("/signin");
  }

  return (
    <DashboardContent
      userEmail={session.user?.email ?? null}
      userName={session.user?.name ?? null}
    />
  );
}

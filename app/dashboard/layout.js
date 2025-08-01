import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardClientLayout } from "@/components/dashboard-client-layout";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return <DashboardClientLayout session={session}>{children}</DashboardClientLayout>;
}

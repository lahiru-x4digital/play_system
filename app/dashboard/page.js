import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/report/tracking-report");
  return null;
}

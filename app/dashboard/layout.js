import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard-nav";
import { TopBar } from "@/components/top-bar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function DashboardLayout(props) {
  const { children } = props;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  // Get additional user data from localStorage (client-side only)
  let userData = null;
  if (typeof window !== "undefined") {
    try {
      userData = JSON.parse(localStorage.getItem("userData"));
    } catch (error) {
      console.error("Error parsing userData:", error);
    }
  }

  // Combine session data with stored user data
  const userInfo = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || null,
    user_type: userData?.user?.user_type || session.user.user_type || "User",
    branchId: userData?.user?.branchId || session.user.branchId || null,
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={userInfo} />
        <div className="flex-1">
          <div className="flex items-center border-b py-2">
            <SidebarTrigger className="right-5 z-2 rounded-r-lg flex h-8 w-8 items-center justify-center rounded-none bg-background shadow transition-all bg-gray-100 text-gray-500" />
            <TopBar user={userInfo} />
          </div>
          <main className="flex-1 overflow-auto p-2">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

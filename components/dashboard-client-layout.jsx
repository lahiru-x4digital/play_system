'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/dashboard-nav';
import { TopBar } from '@/components/top-bar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardClientLayout({ session, children }) {
  const [userInfo, setUserInfo] = useState({
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || null,
    user_type: session.user.user_type || 'User',
    branchId: session.user.branchId || null,
  });

  useEffect(() => {
    // This code will only run on the client side
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData?.user) {
        setUserInfo(prev => ({
          ...prev,
          user_type: userData.user.user_type || prev.user_type,
          branchId: userData.user.branchId || prev.branchId,
        }));
      }
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }, []);

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

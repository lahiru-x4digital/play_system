'use client'
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { usePathname } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { AutoBookingDialog } from "./booking/AutoBookingDialog"

export function TopBar({ user }) {
  const pathname = usePathname()

  // Convert path to breadcrumb
  const getPageInfo = (path) => {
    const segments = path.split('/').filter(Boolean)
    
    // Convert path segments to readable titles
    const formatSegment = (segment) => {
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Get the main page title (last segment)
    const title = formatSegment(segments[segments.length - 1] || 'Dashboard')

    // Create breadcrumb path
    const breadcrumb = segments.map(formatSegment).join(' / ')

    return { title, breadcrumb }
  }

  const { title, breadcrumb } = getPageInfo(pathname)

  return (
    <header className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        {/* Page Title and Breadcrumb */}
        <div className="flex flex-col">
          <h1 className="text-md xl:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {breadcrumb}
          </p>
        </div>
      

        <div className="flex-1" />
        <div>
       <AutoBookingDialog playReservationsRefres={() => {}} />
        </div>
        <div className="flex items-end gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hidden relative w-8 h-8 top-0.5">
            <Bell className="h-3 w-3" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* User Navigation */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
} 
"use client"

import { LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

export function UserNav({ user }) {
  const [userType, setUserType] = useState(user.user_type || 'User')
  const [userName, setUserName] = useState(user.name)
  const [userImage, setUserImage] = useState(user.image)
  
  // Get user data from localStorage and set up listener for updates
  useEffect(() => {
    const updateUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'))
        if (userData?.user) {
          setUserType(userData.user.user_type || 'User')
          setUserName(userData.user.first_name && userData.user.last_name 
            ? `${userData.user.first_name} ${userData.user.last_name}` 
            : userData.user.name || user.name)
          setUserImage(userData.user.image || user.image)
        }
      } catch (error) {
        console.error('Error getting user data:', error)
      }
    }

    // Initial load
    updateUserData()

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        updateUserData()
      }
    }

    // Listen for custom events (for same-tab updates)
    const handleUserDataUpdate = () => {
      updateUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userDataUpdated', handleUserDataUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
    }
  }, [user.name, user.image])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm p-1.5 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors duration-150 md:px-2 min-h-0 min-w-0"
          aria-label="Open user menu"
        >          <Avatar className="h-6 w-6 md:h-7 md:w-7 ring-2 ring-primary/20">
            <AvatarImage src={userImage} alt={userName} className="object-cover" />
            <AvatarFallback className="bg-primary text-white font-semibold text-xs">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col justify-center text-left mr-1.5">
            <span className="text-[14px] font-semibold leading-tight text-gray-900 dark:text-white truncate max-w-[95px]">{userName}</span>
            <span className="text-[10px] text-primary/80 dark:text-primary-300 font-medium tracking-wide">{userType}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[220px] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 px-0" align="end">
        <DropdownMenuLabel className="px-4 pb-2 pt-1">
          <div className="flex items-center gap-3">            <Avatar className="h-9 w-9 ring-2 ring-primary/40">
              <AvatarImage src={userImage} alt={userName} className="object-cover" />
              <AvatarFallback className="bg-primary text-white font-semibold">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</span>
              <span className="text-xs text-primary/80 dark:text-primary-300 font-medium">{userType}</span>
              <span className="text-xs text-muted-foreground">My Account</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuGroup>
          <Link href="/dashboard/settings/users/profile" passHref legacyBehavior>
            <DropdownMenuItem 
              className="hover:bg-primary/10 focus:bg-primary/20 transition-colors cursor-pointer rounded-md px-4 py-2 flex items-center gap-2"
              as="a"
            >
              <User className="h-4 w-4 text-primary" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          {/* <DropdownMenuItem className="hover:bg-primary/10 focus:bg-primary/20 transition-colors cursor-pointer rounded-md px-4 py-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <span>Settings</span>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer rounded-md px-4 py-2 flex items-center gap-2"
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
            localStorage.removeItem('otpVerified');
            signOut({ 
              callbackUrl: "/auth",
              redirect: true,
            });
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
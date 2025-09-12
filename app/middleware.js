// Example of default export
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const currentPath = request.nextUrl.pathname;
  console.log("currentPath", token)
  // Allow OTP verification page and API routes
  if (currentPath.startsWith('/api/') || currentPath === '/auth/otp') {
    return NextResponse.next();
  }
  
  // If there's no token and user is not on auth page, redirect to auth
  if (!token && !currentPath.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If there is a token and user is on auth page (except OTP), redirect to dashboard/booking
  if (token && currentPath.startsWith('/auth') && !currentPath.startsWith('/auth/otp')) {
    return NextResponse.redirect(new URL('/dashboard/ticketing', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/'
  ]
};
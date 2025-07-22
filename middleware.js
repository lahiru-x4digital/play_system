import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/auth',
  '/auth/forgot-password',
  '/auth/otp',
  '/auth/reset-password',
];

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  console.log('MIDDLEWARE:', { pathname, token });

  // If on root path, redirect based on auth state
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = token ? '/dashboard' : '/auth';
    return NextResponse.redirect(url);
  }

  // Allow requests to public paths for unauthenticated users
  if (!token && PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to /auth
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from /auth
  if (token && pathname.startsWith('/auth')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Otherwise, allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', // root
    '/dashboard/:path*',
    '/auth/:path*',
    // ...other protected routes
  ],
};

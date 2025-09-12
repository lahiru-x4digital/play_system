import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "react-hot-toast";
import LocalStorageSync from "@/components/common/LocalStorageSync";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Play",
  description: "Play",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocalStorageSync userId={userId} />
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

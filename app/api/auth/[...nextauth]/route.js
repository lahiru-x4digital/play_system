import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userService } from "@/services/user.service";

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth",
    error: "/auth", // Custom error page
    signOut: "/auth", // Redirect to login page after signout
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const response = await userService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!response?.token || !response?.user) {
            throw new Error("Invalid credentials");
          }

          // Check if OTP is required
          const otpRequired = response?.user?.otpRequired || false;

          return {
            ...response.user,
            accessToken: response.token,
            otpRequired, // Include OTP status in the user object
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.user_type = user.user_type;
        token.otpRequired = user.otpRequired;
        token.branchId = user.branchId; // Add branchId to token
        token.is2fa = user.is2fa;
        // Initialize branch object if it doesn't exist
        token.branch = token.branch || {};
        // Add countryId to branch object if user.branch exists
        if (user.branch) {
          token.branch.countryId = user.branch.countryId;
        }
        if (user.branch) {
          token.branch.brandId = user.branch.brandId;
        }
        if (user.branch) {
          token.branch.branch_Code = user.branch.branch_Code; // Add branch_code to token
        }
        if (user.branch) {
          token.branch.Country_code = user.branch.Country_code; // Add branch_name to token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.user_type = token.user_type;
        session.accessToken = token.accessToken;
        session.user.otpRequired = token.otpRequired;
        session.user.branchId = token.branchId;
        session.user.is2fa = token.is2fa;
        // Initialize branch object if it doesn't exist
        session.user.branch = session.user.branch || {};
        // Add countryId to branch object if token.branch exists
        if (token.branch && token.branch.countryId) {
          session.user.branch.countryId = token.branch.countryId;
        }
        if (token.branch && token.branch.brandId) {
          session.user.branch.brandId = token.branch.brandId;
        }
        if (token.branch && token.branch.branch_Code) {
          session.user.branch.branch_Code = token.branch.branch_Code; // Add branch_code to session
        }
        if (token.branch && token.branch.Country_code) {
          session.user.branch.Country_code = token.branch.Country_code; // Add branch_name to session
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };

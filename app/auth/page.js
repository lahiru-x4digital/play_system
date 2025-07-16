import { signIn } from "next-auth/react";

await signIn("credentials", {
  email,
  password,
  redirect: false,
  callbackUrl: "/play/dashboard"
}, { basePath: "/api/play/auth" });
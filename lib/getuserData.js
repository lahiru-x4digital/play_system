import { useSession } from "next-auth/react";

/**
 * Returns the full user object from next-auth session, or null if not logged in
 */
export function useSessionUser() {
  const { data: session } = useSession();
  return session?.user || null;
}

/**
 * Returns true if the current user is an admin, false otherwise
 */
export function useIsAdmin() {
  const user = useSessionUser();
  return user?.user_type === "ADMIN";
}

/**
 * Returns true if the current user is a regular user (user_type === 'USER'), false otherwise
 */
export function useIsUser() {
  const user = useSessionUser();
  return user?.user_type === "USER";
}

// For backward compatibility, keep the default export as useSessionUser
export default useSessionUser;

"use client";

import { createContext, useContext } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { User } from "next-auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Use NextAuth's signIn function directly
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log(`Attempting login for: ${email}`);

      // Use NextAuth's built-in credential login
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
        return false;
      }

      return result?.ok || false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Use NextAuth's signOut function directly
  const logout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading: status === "loading",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

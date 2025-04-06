import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { BASE_URL } from "@/lib/utils";

// Type definitions
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    full_name: string;
    company?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at?: string | null;
    access_token?: string;
  }

  interface Session {
    user: User & {
      name?: string;
      image?: string;
    };
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    full_name: string;
    company?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at?: string | null;
    access_token?: string;
  }
}

export const dynamic = "force-dynamic";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log(`Attempting login for: ${credentials.email}`);

          // Create form data - IMPORTANT: API expects "username", not "email"
          const formData = new URLSearchParams();
          formData.append("username", credentials.email);
          formData.append("password", credentials.password);

          // Make direct fetch request with standard fetch API
          const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            cache: "no-store",
          });

          if (response.status === 401) {
            console.log("Error: ", { error: "Incorrect email or password" });
            throw new Error("Incorrect email or password");
          }
          // Get full response text first to examine it
          const responseText = await response.text();

          // Check if it's HTML (common error)
          if (
            responseText.trim().startsWith("<!DOCTYPE") ||
            responseText.trim().startsWith("<html")
          ) {
            console.error(
              "Received HTML instead of JSON - likely wrong URL or server error",
            );
            console.error("Response preview:", responseText.substring(0, 200));
            return null;
          }

          // Try to parse as JSON
          let data;
          try {
            data = JSON.parse(responseText);
            console.log("Parsed response data:", data);
          } catch (e) {
            console.error("Failed to parse response as JSON:", e);
            console.error("Response text:", responseText);
            return null;
          }

          // Check if login was successful
          if (data && data.access_token) {
            console.log("Login successful, got access token");
            const { user } = data;

            return {
              id: user.id,
              email: user.email,
              full_name:
                user.full_name || user.name || user.email.split("@")[0],
              company: user.company,
              is_verified: user.is_verified || false,
              is_active: user.is_active || true,
              created_at: user.created_at,
              access_token: data.access_token,
            };
          }

          console.log("API response missing access_token:", data);
          return null;
        } catch (error) {
          console.error("Authentication error details:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback called, user present:", !!user);

      // Initial sign in
      if (account && user) {
        console.log("Setting JWT from user data");
        return {
          ...token,
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          company: user.company,
          is_verified: user.is_verified,
          is_active: user.is_active,
          created_at: user.created_at,
          access_token: user.access_token,
        };
      }

      console.log("Returning existing token");
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called");

      // Send properties to the client
      session.user = {
        id: token.id,
        email: token.email,
        name: token.full_name,
        full_name: token.full_name,
        company: token.company,
        is_verified: token.is_verified,
        is_active: token.is_active,
        created_at: token.created_at,
      };

      // Add access token to session
      session.access_token = token.access_token;

      return session;
    },
  },
  debug: true, // Enable debug mode
});

export { handler as GET, handler as POST };

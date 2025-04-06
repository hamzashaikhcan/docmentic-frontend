import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";

// Ensure these are defined or imported correctly
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:3000";
const SALT_ROUNDS = 10;

// Types
export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  expires: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  company: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

// Browser-safe crypto function for generating tokens
export function generateToken(length = 32): string {
  try {
    const array = new Uint8Array(length);

    if (typeof window !== "undefined" && window.crypto) {
      // Browser environment
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for environments without window.crypto
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  } catch (error) {
    console.error("Token generation failed", error);
    return uuidv4(); // Fallback to UUID if all else fails
  }
}

// Simplified session management
const SESSION_KEY = "app_session";

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (error) {
    console.error("Failed to retrieve session", error);
    return null;
  }
}

export function setStoredSession(session: Session | null): void {
  if (typeof window === "undefined") return;

  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error("Failed to set session", error);
  }
}

// Authentication functions
export async function signIn(
  email: string,
  password: string,
): Promise<Session | null> {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    if (response.data?.user) {
      const session: Session = {
        user: {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          image: response.data.user.image,
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      setStoredSession(session);
      return session;
    }

    return null;
  } catch (error) {
    console.error("Sign in failed", error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/api/auth/logout`);
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    setStoredSession(null);
  }
}

export async function getSession(): Promise<Session | null> {
  const storedSession = getStoredSession();

  if (!storedSession) return null;

  // Check session expiration
  if (new Date(storedSession.expires) < new Date()) {
    setStoredSession(null);
    return null;
  }

  return storedSession;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, payload);

    return {
      success: true,
      message: response.data?.message || "Registration successful",
    };
  } catch (error: any) {
    console.error("Registration error", error);

    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  if (!session) return null;

  try {
    const response = await axios.get(`${BASE_URL}/api/users/me`);

    return response.data?.user || null;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return null;
  }
}

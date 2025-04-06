"use client";
import axios from "axios";
import { BASE_URL } from "./utils";

// Simple auth utils without Prisma/NextAuth
export interface User {
  id: string;
  full_name: string;
  email: string;
  image?: string;
}

// Hardcoded test user
const TEST_USER: User = {
  id: "1",
  full_name: "Test User",
  email: "test@gmail.com",
  image:
    "https://ui-avatars.com/api/?name=Test+User&background=1a3c56&color=fff",
};

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const URL = `${BASE_URL}/api/auth/login`;

  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await axios.post(URL, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Assuming the response contains user data
    if (response.data && response.data.user) {
      return response.data.user;
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

// Authentication state management
let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem("auth-user", JSON.stringify(user));
  } else {
    localStorage.removeItem("auth-user");
  }
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;

  // Check local storage for previously logged in user
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("auth-user");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        return currentUser;
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("auth-user");
      }
    }
  }

  return null;
};

export const logout = () => {
  setCurrentUser(null);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Seed the system with test user (simulate auto-login in development)
export const seedAuthSystem = () => {
  if (!getCurrentUser()) {
    setCurrentUser(TEST_USER);
  }
};

import axios from "axios";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";

export const createAxiosForServer = async () => {
  const token = await getToken({
    req: {
      headers: Object.fromEntries(await headers()),
      cookies: Object.fromEntries(await cookies()),
    } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: token?.access_token
      ? { Authorization: `Bearer ${token.access_token}` }
      : {},
  });
};

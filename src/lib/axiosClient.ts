// lib/axiosClient.ts
"use client";

import axios from "axios";
import { getSession } from "next-auth/react";
import { BASE_URL } from "./utils";

const axiosClient = axios.create({
  baseURL: BASE_URL,
});

// Attach token from client session
axiosClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;

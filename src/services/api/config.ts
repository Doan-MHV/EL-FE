"use client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const AI_URL = process.env.NEXT_PUBLIC_AI_URL;
export const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;
export const AUTH_REFRESH_URL = API_URL + "/v1/auth/refresh";
export const AUTH_ME_URL = API_URL + "/v1/auth/me";
export const AUTH_LOGOUT_URL = API_URL + "/v1/auth/logout";

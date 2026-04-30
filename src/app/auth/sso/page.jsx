"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import localStorageService from "@/utils/localStorageService";

const parseRole = (rawRole) => {
  try {
    const parsed = JSON.parse(rawRole);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") return [parsed];
    return [];
  } catch {
    return rawRole ? [rawRole] : [];
  }
};

export default function SSOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const rawRole = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const roles = parseRole(rawRole);
    localStorageService.setToken(token);
    localStorageService.setRole(roles);

    if (userId) {
      localStorageService.setUserId(userId);
    }

    if (roles.includes("staff")) {
      router.replace("/orders/current");
      return;
    }

    router.replace("/statistic/revenue");
  }, [router, searchParams]);

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <p className='text-gray-600'>Đang chuyển hướng...</p>
    </div>
  );
}

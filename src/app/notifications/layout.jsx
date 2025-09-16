"use client";
import Protected from "@/hooks/useRoleProted";

export default function Layout({ children }) {
  return <Protected role={["staff", "manager", "owner"]}>{children}</Protected>;
}

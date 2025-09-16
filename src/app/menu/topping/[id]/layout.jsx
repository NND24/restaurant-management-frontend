"use client";
import Protected from "@/hooks/useRoleProted";

export default function Layout({ children }) {
  return <Protected role={["manager", "staff", "owner"]}>{children}</Protected>;
}

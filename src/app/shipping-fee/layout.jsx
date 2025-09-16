"use client";
import Protected from "../../hooks/useRoleProted";

export default function Layout({ children }) {
  return <Protected role={["owner"]}>{children}</Protected>;
}

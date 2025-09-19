"use client";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "../context/SocketContext";
import { AuthProvider } from "@/context/AuthContext";
import SidebarLayout from "@/components/SidebarLayout";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang='en'>
      <body>
        <SocketProvider>
          <AuthProvider>
            {isAuthPage ? children : <SidebarLayout>{children}</SidebarLayout>}
            <ToastContainer position='top-right' autoClose={5000} />
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

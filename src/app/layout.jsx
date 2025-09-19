import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "../context/SocketContext";
import { AuthProvider } from "@/context/AuthContext";
import SidebarLayout from "@/components/SidebarLayout";

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <SocketProvider>
          <AuthProvider>
            <div>
              <SidebarLayout>{children}</SidebarLayout>
            </div>
            <ToastContainer position='top-right' autoClose={5000} />
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "../context/SocketContext";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <SocketProvider>
                    {children}
                    <ToastContainer position="top-right" autoClose={5000} />
                </SocketProvider>
            </body>
        </html>
    );
}

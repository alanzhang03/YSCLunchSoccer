import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata = {
  title: "YSC Lunch Soccer",
  description: "YSC Lunch Soccer Session Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={openSans.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

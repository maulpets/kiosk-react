import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/store/AppContext";
import { Header } from "@/components/layout/Header";
import { RouteGuard } from "@/components/RouteGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiosk React App",
  description: "A multipage React web app designed for React Native WebView",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <RouteGuard>
            <Header />
            {children}
          </RouteGuard>
        </AppProvider>
      </body>
    </html>
  );
}

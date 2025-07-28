import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/store/AppContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeLayout } from "@/components/layout/ThemeLayout";
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <RouteGuard>
              <ThemeLayout>
                <Header />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </ThemeLayout>
            </RouteGuard>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

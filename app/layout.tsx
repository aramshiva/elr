import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "elr",
  description: "An minimal URL shortener service.",
  icons: {
    icon: [
      { url: "/favicon64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon128.png", sizes: "128x128", type: "image/png" },
    ],
  },
  openGraph: {
    images: [
      {
        url: "/preview.jpg",
        width: 1200,
        height: 630,
        alt: "elr - An minimal URL shortener service.",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html>
        <SessionProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Toaster position="bottom-center" richColors />
            {children}
          </body>
        </SessionProvider>
      </html>
    </>
  );
}

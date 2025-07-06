import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Provider from "@/components/Provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Küchenonline Kundenportal",
  description: "Ihr persönliches Kundenportal",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

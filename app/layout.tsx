import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "School Recognition & Inspection Management System",
  description:
    "Digital platform for school registration, inspection management, and digital certificate generation. Streamlining educational administration.",
  keywords:
    "school recognition, inspection management, digital certificates, education portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}

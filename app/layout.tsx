import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipAlert",
  description: "Car flip deal alerts — faster than anyone else",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-white antialiased">{children}</body>
    </html>
  );
}

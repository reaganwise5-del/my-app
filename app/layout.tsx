import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipAlert",
  description: "Car flip deal alerts — faster than anyone else",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full antialiased" style={{ background: '#FAF8F5', color: '#1A1A2E' }}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Itinerary / Task Manager",
  description: "Organize your life, one task at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
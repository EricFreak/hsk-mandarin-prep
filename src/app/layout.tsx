import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSK Mandarin Prep",
  description: "HSK exam preparation web app",
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

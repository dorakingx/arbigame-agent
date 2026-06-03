import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArbiGame Agent",
  description: "Create Web3 games on Arbitrum with AI."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

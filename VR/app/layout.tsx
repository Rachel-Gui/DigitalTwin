import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHI · Air in Motion",
  description: "A WebXR translation of the PHI Rhino and Grasshopper experience.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

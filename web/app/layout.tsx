import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henry · Opportunity Feed",
  description: "Reddit-sourced AI/automation opportunity signals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PS Speech & Hearing Clinic",
  description: "Speech therapy, audiology, hearing aid, and clinic management portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

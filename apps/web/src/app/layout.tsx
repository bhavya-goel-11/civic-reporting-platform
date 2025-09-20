import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Reporting Admin Portal",
  description: "Admin portal for managing civic reports and infrastructure issues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased min-h-full bg-white dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}

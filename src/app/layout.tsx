import type { Metadata } from "next";
import "./globals.css";
import AdminLayout from "../components/AdminLayout";

export const metadata: Metadata = {
  title: "PetGo Admin | Management System",
  description: "Administrative dashboard for PetGo fleet and user management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AdminLayout>
          {children}
        </AdminLayout>
      </body>
    </html>
  );
}

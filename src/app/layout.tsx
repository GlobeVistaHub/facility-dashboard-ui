import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facility Command Center",
  description: "Engineering Facility Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Note on RTL: dir="rtl" naturally flows the Sidebar on the right when using flex-row */
  return (
    <ClerkProvider>
      <html
        lang="ar"
        dir="rtl"
        className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      >
        {/* We add a Google Material Symbols tag here for the sidebar icons */}
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        </head>
        <body className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface relative overflow-x-hidden">
          {/* Background Ambient Layers */}
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-20%] left-0 w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <Sidebar />
          
          <main className="flex-1 flex flex-col min-h-screen md:h-screen overflow-y-auto w-full pb-20 md:pb-0">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FluxSQL — Diseña tu base de datos en equipo",
  description: "Genera diagramas ER desde SQL, colabora en tiempo real y comparte tus esquemas con tu equipo. Sin instalaciones.",
};

import { PresenceProvider } from "@/components/providers/PresenceProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${inter.variable} min-h-full flex flex-col font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            storageKey="fluxsql-theme"
          >
          <PresenceProvider>
            {children}
            <Toaster />
          </PresenceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

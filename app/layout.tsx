import type { Metadata } from "next";
import Link from "next/link";
import { Truck } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Courier - Entregas Rapiditas",
  description: "Administración de destinos y seguimiento de envíos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-zinc-200">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6">
            <Link
              href="/"
              className="font-semibold text-accent flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              Entregas Rapiditas
            </Link>
            <Link
              href="/ciudades"
              className="text-sm text-zinc-600 hover:text-accent"
            >
              Ciudades
            </Link>
            <Link
              href="/estados"
              className="text-sm text-zinc-600 hover:text-accent"
            >
              Estados
            </Link>
            <Link
              href="/ordenes"
              className="text-sm text-zinc-600 hover:text-accent"
            >
              Órdenes
            </Link>
          </div>
        </nav>
        <div className="flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}

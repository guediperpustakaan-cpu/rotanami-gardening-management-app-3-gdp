import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { TrakteerWidget } from "@/components/TrakteerWidget";

export const metadata: Metadata = {
  title: "Rotanami - Manajemen Petak Kebun & Rotasi Tanaman",
  description:
    "Aplikasi berbahasa Indonesia untuk membantu pekebun rumahan, kebun komunitas, dan petani skala kecil mengelola petak, mencatat riwayat tanam, merencanakan rotasi tanaman, dan memantau kesehatan tanah.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FBF9F5] text-stone-900 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950 flex flex-col">
        <ToastProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 lg:mb-6">
              {children}
            </main>
            <TrakteerWidget />
          </AppProvider>
        </ToastProvider>
        <footer className="w-full text-center py-5 px-4 text-[11px] font-medium text-stone-400 border-t border-stone-200/60 pb-24 lg:pb-5">
          Rotanami 🌱 — Aplikasi Manajemen Kebun &amp; Rotasi Tanaman ·{" "}
          <span className="font-semibold text-stone-500">
            Open Source oleh MZF - 2026
          </span>
        </footer>
      </body>
    </html>
  );
}

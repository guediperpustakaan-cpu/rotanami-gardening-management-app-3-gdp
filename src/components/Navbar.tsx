"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Home,
  LayoutGrid,
  RotateCw,
  BookOpen,
  Calendar,
  FlaskConical,
  Settings,
  ChevronDown,
  Plus,
  Sparkles,
  Menu,
  X,
  Sprout,
  Check,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { activeFarm, farms, switchFarm, resetDemoData, isLoading } = useApp();
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/plots", label: "Petak", icon: LayoutGrid },
    { href: "/rotation", label: "Perencana Rotasi", icon: RotateCw },
    { href: "/crops", label: "Katalog Tanaman", icon: BookOpen },
    { href: "/calendar", label: "Jadwal & Tugas", icon: Calendar },
    { href: "/soil", label: "Kesehatan Tanah", icon: FlaskConical },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  const mobileBottomLinks = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/plots", label: "Petak", icon: LayoutGrid },
    { href: "/rotation", label: "Rotasi", icon: RotateCw },
    { href: "/crops", label: "Katalog", icon: BookOpen },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-900 transition-colors">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-emerald-950 font-serif">
                    Rotanami
                  </span>
                  <span className="hidden md:inline-block ml-2 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                    Kebun Sehat & Rotasi Tanam
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-100/80 text-emerald-900 font-semibold"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-stone-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Farm Switcher & Quick Demo State */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-left transition-colors max-w-[220px] sm:max-w-[280px]"
                  aria-expanded={isFarmDropdownOpen}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {activeFarm?.name || "Kebun Mandiri"}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      {activeFarm?.location || "Pekarangan Aktif"}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-auto" />
                </button>

                {/* Dropdown Menu */}
                {isFarmDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFarmDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200 shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Daftar Kebun Anda
                        </p>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-1">
                        {farms.map((f) => {
                          const isSelected = f.id === activeFarm?.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                switchFarm(f.id);
                                setIsFarmDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left flex items-start justify-between hover:bg-stone-50 transition-colors ${
                                isSelected ? "bg-emerald-50/60 font-semibold" : ""
                              }`}
                            >
                              <div className="truncate mr-2">
                                <p className="text-xs font-medium text-stone-900 truncate">
                                  {f.name}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {f.location || "Lokasi belum diatur"}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="px-3 pt-2 mt-1 border-t border-stone-100 space-y-1">
                        <Link
                          href="/settings"
                          onClick={() => setIsFarmDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-500" />
                          <span>Buat Kebun Baru / Kelola</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            resetDemoData();
                            setIsFarmDropdownOpen(false);
                          }}
                          disabled={isLoading}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 rounded-lg"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Muat Ulang Data Contoh</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Hamburger Button for extra menu */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                aria-label="Buka menu lengkap"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white p-4 space-y-1 shadow-lg animate-in slide-in-from-top-1">
            <p className="text-xs font-semibold text-stone-400 px-3 py-1 uppercase tracking-wider">
              Menu Lengkap
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-emerald-100 text-emerald-900 font-semibold"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-stone-500"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Sticky Thumb-reach) */}
      <nav
        aria-label="Navigasi bawah ponsel"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1 safe-area-bottom"
      >
        <div className="grid grid-cols-5 items-center justify-around">
          {mobileBottomLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive ? "text-emerald-800 font-bold" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "text-stone-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate mt-0.5">{link.label}</span>
              </Link>
            );
          })}

          {/* Fifth item: More / Lainnya */}
          <Link
            href="/calendar"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[11px] font-medium transition-colors ${
              pathname === "/calendar" || pathname === "/soil" || pathname === "/settings"
                ? "text-emerald-800 font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                pathname === "/calendar" || pathname === "/soil" || pathname === "/settings"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-stone-500"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <span className="truncate mt-0.5">Jadwal</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

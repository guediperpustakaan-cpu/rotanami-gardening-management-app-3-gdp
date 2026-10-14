"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  Settings,
  Building,
  User,
  Download,
  Sparkles,
  Save,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

export default function SettingsPage() {
  const { activeFarm, user, refreshSession, resetDemoData, isLoading } = useApp();
  const { showToast } = useToast();

  const [farmForm, setFarmForm] = useState({
    name: "",
    location: "",
    description: "",
    timezone: "Asia/Jakarta",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
  });

  const [newFarmForm, setNewFarmForm] = useState({
    name: "",
    location: "",
    description: "",
    timezone: "Asia/Jakarta",
  });

  const [isUpdatingFarm, setIsUpdatingFarm] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isCreatingFarm, setIsCreatingFarm] = useState(false);
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);

  useEffect(() => {
    if (activeFarm) {
      setFarmForm({
        name: activeFarm.name || "",
        location: activeFarm.location || "",
        description: activeFarm.description || "",
        timezone: activeFarm.timezone || "Asia/Jakarta",
      });
    }
    if (user) {
      setUserForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [activeFarm, user]);

  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;
    try {
      setIsUpdatingFarm(true);
      const res = await fetch(`/api/farms/${activeFarm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(farmForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Profil kebun berhasil diperbarui", "success");
        await refreshSession();
      } else {
        showToast(json.error || "Gagal memperbarui kebun", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsUpdatingFarm(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingUser(true);
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-user",
          name: userForm.name,
          email: userForm.email,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Profil pengguna berhasil disimpan", "success");
        await refreshSession();
      } else {
        showToast(json.error || "Gagal memperbarui profil", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCreateNewFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmForm.name.trim()) {
      showToast("Nama kebun wajib diisi", "error");
      return;
    }
    try {
      setIsCreatingFarm(true);
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFarmForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Kebun baru berhasil dibuat", "success");
        setShowNewFarmModal(false);
        setNewFarmForm({
          name: "",
          location: "",
          description: "",
          timezone: "Asia/Jakarta",
        });
        await refreshSession();
      } else {
        showToast(json.error || "Gagal membuat kebun", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsCreatingFarm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-stone-200 text-stone-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Pengaturan & Data
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Kelola profil kebun aktif, identitas pekebun, ekspor CSV, dan data contoh.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Profil Kebun Aktif */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-emerald-800" />
            <h2 className="font-bold text-stone-900 text-base">Profil Kebun Aktif</h2>
          </div>
          <button
            onClick={() => setShowNewFarmModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Kebun Baru</span>
          </button>
        </div>

        <form onSubmit={handleUpdateFarm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nama Kebun *
              </label>
              <input
                type="text"
                required
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Lokasi / Wilayah
              </label>
              <input
                type="text"
                placeholder="Contoh: Bandung, Jawa Barat"
                value={farmForm.location}
                onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Zona Waktu
              </label>
              <select
                value={farmForm.timezone}
                onChange={(e) => setFarmForm({ ...farmForm, timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              >
                <option value="Asia/Jakarta">WIB - Asia/Jakarta (UTC+7)</option>
                <option value="Asia/Makassar">WITA - Asia/Makassar (UTC+8)</option>
                <option value="Asia/Jayapura">WIT - Asia/Jayapura (UTC+9)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Deskripsi Kebun (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Kebun komunitas sayur pangan mandiri"
                value={farmForm.description}
                onChange={(e) => setFarmForm({ ...farmForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingFarm}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingFarm ? "Menyimpan..." : "Simpan Profil Kebun"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Profil Pengguna / Pekebun */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-stone-900 text-base">Profil Pengguna</h2>
        </div>

        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nama Lengkap / Panggilan *
              </label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingUser}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingUser ? "Menyimpan..." : "Simpan Profil"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Ekspor Data CSV */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-stone-900 text-base">Ekspor Data (Format CSV)</h2>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Unduh data kebun Anda dalam format CSV dengan enkoding UTF-8 yang kompatibel dengan Microsoft Excel, Google Sheets, dan LibreOffice Calc.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Riwayat Penanaman</h3>
              <p className="text-xs text-stone-500 mt-1">
                Data lengkap tanggal tanam, tanggal panen, status, hasil panen, satuan, dan keluarga botani.
              </p>
            </div>
            <a
              href="/api/export/csv?type=plantings"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV Riwayat Tanam</span>
            </a>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Hasil Uji Kesehatan Tanah</h3>
              <p className="text-xs text-stone-500 mt-1">
                Data pengukuran nilai pH, kadar N, P, K, bahan organik, metode uji, dan catatan lapangan.
              </p>
            </div>
            <a
              href="/api/export/csv?type=soil_tests"
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV Uji Tanah</span>
            </a>
          </div>
        </div>
      </div>

      {/* Section 4: Manajemen Data Contoh & Eksplorasi */}
      <div className="bg-stone-100/80 p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-stone-900 text-base">Eksplorasi & Muat Ulang Data Contoh</h2>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Ingin mencoba alur aplikasi dengan skenario data lengkap? Anda dapat memuat ulang contoh kebun percontohan, bedeng, riwayat tanam, dan hasil uji tanah yang sudah disiapkan.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={resetDemoData}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{isLoading ? "Memproses Data..." : "Muat Ulang Data Contoh Lengkap"}</span>
          </button>
        </div>
      </div>

      {/* Modal: Buat Kebun Baru */}
      {showNewFarmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Buat Kebun Baru</h3>
              <button
                onClick={() => setShowNewFarmModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNewFarm} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Kebun *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kebun Sayur Komunitas RW 05"
                  value={newFarmForm.name}
                  onChange={(e) => setNewFarmForm({ ...newFarmForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Lokasi Kebun
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Yogyakarta, D.I. Yogyakarta"
                  value={newFarmForm.location}
                  onChange={(e) => setNewFarmForm({ ...newFarmForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat kebun..."
                  value={newFarmForm.description}
                  onChange={(e) => setNewFarmForm({ ...newFarmForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewFarmModal(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFarm}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCreatingFarm ? "Membuat..." : "Buat Kebun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

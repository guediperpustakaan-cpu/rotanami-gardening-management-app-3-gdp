"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  Sprout,
  Plus,
  RotateCw,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Layers,
  Sparkles,
  Info,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import { NutrientCategoryBadge, PlantingStatusBadge, PhStatusBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";

interface EnrichedPlot {
  id: string;
  name: string;
  size: string;
  unit: string;
  soilType?: string | null;
  sunlight?: string | null;
  notes?: string | null;
  status: string;
  currentOrLatestPlanting?: {
    id: string;
    cropName: string;
    scientificName?: string | null;
    startDate: string;
    status: string;
    nutrientCategory: string;
    familyName?: string | null;
  } | null;
  latestSoilTest?: {
    ph?: string | null;
    nitrogenCategory?: string | null;
    testDate: string;
  } | null;
}

interface TaskItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  plotName?: string | null;
  notes?: string | null;
}

interface CropItem {
  id: string;
  commonName: string;
}

export default function DashboardPage() {
  const { activeFarm, user, resetDemoData, isLoading: appLoading } = useApp();
  const { showToast } = useToast();

  const [plotsList, setPlotsList] = useState<EnrichedPlot[]>([]);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [rotationPlansCount, setRotationPlansCount] = useState<number>(0);
  const [cropsList, setCropsList] = useState<CropItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick action modals
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [isAddPlantingModalOpen, setIsAddPlantingModalOpen] = useState(false);

  // Form states
  const [plotForm, setPlotForm] = useState({
    name: "",
    size: "15",
    unit: "m²",
    soilType: "Lempung berpasir",
    sunlight: "Penuh (>6 jam)",
    notes: "",
  });

  const [plantingForm, setPlantingForm] = useState({
    plotId: "",
    cropId: "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "ditanam",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plotsRes, tasksRes, plansRes, cropsRes] = await Promise.all([
        fetch("/api/plots"),
        fetch("/api/tasks?completed=false"),
        fetch("/api/rotation-plans"),
        fetch("/api/crops"),
      ]);

      const [plotsJson, tasksJson, plansJson, cropsJson] = await Promise.all([
        plotsRes.json(),
        tasksRes.json(),
        plansRes.json(),
        cropsRes.json(),
      ]);

      if (plotsJson.success) setPlotsList(plotsJson.data || []);
      if (tasksJson.success) setTasksList(tasksJson.data || []);
      if (plansJson.success) setRotationPlansCount(plansJson.data?.length || 0);
      if (cropsJson.success) setCropsList(cropsJson.data || []);

      if (plotsJson.data && plotsJson.data.length > 0 && !plantingForm.plotId) {
        setPlantingForm((prev) => ({ ...prev, plotId: plotsJson.data[0].id }));
      }
      if (cropsJson.data && cropsJson.data.length > 0 && !plantingForm.cropId) {
        setPlantingForm((prev) => ({ ...prev, cropId: cropsJson.data[0].id }));
      }
    } catch {
      showToast("Gagal memuat ringkasan dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, plantingForm.plotId, plantingForm.cropId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, activeFarm?.id]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTasksList((prev) => prev.filter((t) => t.id !== taskId));
        showToast(!currentStatus ? "Tugas berhasil diselesaikan!" : "Tugas diaktifkan kembali", "success");
      }
    } catch {
      showToast("Gagal memperbarui status tugas", "error");
    }
  };

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotForm.name.trim()) {
      showToast("Nama petak wajib diisi", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plotForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Petak baru berhasil ditambahkan", "success");
        setIsAddPlotModalOpen(false);
        setPlotForm({
          name: "",
          size: "15",
          unit: "m²",
          soilType: "Lempung berpasir",
          sunlight: "Penuh (>6 jam)",
          notes: "",
        });
        await fetchDashboardData();
      } else {
        showToast(json.error || "Gagal membuat petak", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlanting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantingForm.plotId || !plantingForm.cropId) {
      showToast("Pilih petak dan tanaman", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/plantings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantingForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Riwayat tanam berhasil dicatat", "success");
        setIsAddPlantingModalOpen(false);
        setPlantingForm((prev) => ({
          ...prev,
          notes: "",
        }));
        await fetchDashboardData();
      } else {
        showToast(json.error || "Gagal mencatat penanaman", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hitung metrik
  const totalPlots = plotsList.length;
  const activePlantedPlots = plotsList.filter(
    (p) => p.currentOrLatestPlanting && p.currentOrLatestPlanting.status === "ditanam"
  ).length;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 11
      ? "Selamat pagi"
      : greetingHour < 15
      ? "Selamat siang"
      : greetingHour < 18
      ? "Selamat sore"
      : "Selamat malam";

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Hero Welcome & Farm Status */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-48 h-48 bg-amber-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold bg-emerald-700/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600/40">
                {activeFarm?.isDemo ? "Data contoh aktif" : "Kebun Anda"}
              </span>
              {activeFarm?.location && (
                <span className="text-xs text-emerald-200/80">
                  • {activeFarm.location}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              {greeting}, {user?.name || "Pekebun"}!
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl leading-relaxed">
              Selamat mengelola <strong className="text-white font-semibold">{activeFarm?.name}</strong>. Rawat petak tanah, pantau rotasi botani, dan jaga kesuburan tanah secara berkelanjutan.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsAddPlotModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Petak</span>
            </button>
            <button
              onClick={() => setIsAddPlantingModalOpen(true)}
              disabled={plotsList.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-xs border border-white/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>Catat Tanaman</span>
            </button>
            <Link
              href="/rotation"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-98 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Rencana Rotasi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Petak</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">{totalPlots}</p>
            <p className="text-[11px] text-stone-400">Bedeng kebun aktif</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-lime-100 text-lime-800 shrink-0">
            <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Sedang Ditanami</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">{activePlantedPlots}</p>
            <p className="text-[11px] text-stone-400">Petak berkultivasi</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-800 shrink-0">
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Rencana Rotasi</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">{rotationPlansCount}</p>
            <p className="text-[11px] text-stone-400">Musim berjalan</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Tugas Tertunda</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">{tasksList.length}</p>
            <p className="text-[11px] text-stone-400">Perlu tindakan</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Daftar Petak + Agenda Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 spans): Daftar Petak & Kondisi */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
                Daftar Petak Kebun
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Status tanaman saat ini, jenis tanah, dan pH terakhir
              </p>
            </div>
            <Link
              href="/plots"
              className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {totalPlots === 0 ? (
            <EmptyState
              title="Belum ada petak di kebun ini"
              description="Mulai langkah pertama dengan membuat petak atau bedeng pertama Anda untuk mencatat tanaman dan merencanakan rotasi."
              action={{
                label: "Tambah Petak Sekarang",
                onClick: () => setIsAddPlotModalOpen(true),
              }}
              secondaryAction={{
                label: "Muat Data Contoh",
                onClick: resetDemoData,
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plotsList.map((plot) => {
                const latestPlanting = plot.currentOrLatestPlanting;
                return (
                  <Link
                    key={plot.id}
                    href={`/plots/${plot.id}`}
                    className="block p-5 bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-stone-900 group-hover:text-emerald-800 transition-colors text-base">
                          {plot.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {plot.size} {plot.unit} • {plot.soilType || "Tanah belum ditentukan"}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          plot.status === "aktif"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {plot.status === "aktif" ? "Aktif" : "Istirahat"}
                      </span>
                    </div>

                    {/* Status Tanaman Saat Ini */}
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500 font-medium">Tanaman Terakhir:</span>
                        {latestPlanting ? (
                          <PlantingStatusBadge status={latestPlanting.status} />
                        ) : (
                          <span className="text-stone-400 italic">Belum ada riwayat</span>
                        )}
                      </div>

                      {latestPlanting ? (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                            <Sprout className="w-4 h-4 text-emerald-700" />
                            <span>{latestPlanting.cropName}</span>
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span>Mulai: {latestPlanting.startDate}</span>
                            <span className="font-medium text-stone-700">
                              {latestPlanting.familyName || "Tanaman Pangan"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500">
                          Siap untuk penanaman awal atau uji tanah.
                        </p>
                      )}
                    </div>

                    {/* Status Tanah & Aksi */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-stone-400" />
                        <PhStatusBadge ph={plot.latestSoilTest?.ph} />
                      </div>
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Detail Petak <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Aktivitas & Pengingat Tugas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
                Aktivitas & Pengingat
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">Tugas terjadwal di kebun</p>
            </div>
            <Link
              href="/calendar"
              className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900"
            >
              Semua Tugas
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            {tasksList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-80" />
                <p className="text-sm font-bold text-stone-800">Semua tugas beres!</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Tidak ada pengingat mendesak saat ini. Anda dapat membuat jadwal baru di halaman kalender.
                </p>
                <Link
                  href="/calendar"
                  className="inline-block mt-2 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  + Tambah Jadwal Baru
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasksList.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-stone-100 hover:border-stone-300 bg-stone-50/50 hover:bg-white transition-all flex items-start gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="mt-0.5 text-stone-400 hover:text-emerald-700 transition-colors shrink-0"
                      title="Tandai selesai"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                        {task.plotName && (
                          <span className="bg-stone-200/70 text-stone-700 px-1.5 py-0.2 rounded">
                            {task.plotName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Tips Box */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Prinsip Rotasi Rotanami:</strong>
                Hindari menanam keluarga botani yang sama secara beruntun di petak yang sama untuk memutus siklus hama dan menyeimbangkan kebutuhan hara tanah.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Petak Baru */}
      {isAddPlotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Tambah Petak Baru</h3>
              <button
                onClick={() => setIsAddPlotModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlot} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Petak / Bedeng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bedeng 1 (Timur - Terik)"
                  value={plotForm.name}
                  onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Ukuran Luas *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={plotForm.size}
                    onChange={(e) => setPlotForm({ ...plotForm, size: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Satuan Luas
                  </label>
                  <select
                    value={plotForm.unit}
                    onChange={(e) => setPlotForm({ ...plotForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="m²">m² (Meter persegi)</option>
                    <option value="bedeng">Bedeng</option>
                    <option value="tumbak">Tumbak / Bata</option>
                    <option value="ru">Ru</option>
                    <option value="hektar">Hektar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Jenis Tanah
                  </label>
                  <select
                    value={plotForm.soilType}
                    onChange={(e) => setPlotForm({ ...plotForm, soilType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Lempung berpasir">Lempung berpasir</option>
                    <option value="Gembur berhumus">Gembur berhumus</option>
                    <option value="Liat gembur">Liat gembur</option>
                    <option value="Tanah merah lempung">Tanah merah lempung</option>
                    <option value="Gambut / Organik">Gambut / Organik</option>
                    <option value="Belum diuji">Belum diketahui</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Pencahayaan Matahari
                  </label>
                  <select
                    value={plotForm.sunlight}
                    onChange={(e) => setPlotForm({ ...plotForm, sunlight: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Penuh (>6 jam)">Penuh (&gt;6 jam)</option>
                    <option value="Sebagian (3-6 jam)">Sebagian (3-6 jam)</option>
                    <option value="Teduh (<3 jam)">Teduh (&lt;3 jam)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Petak (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Dekat sumber air siram, ada naungan pohon di barat..."
                  value={plotForm.notes}
                  onChange={(e) => setPlotForm({ ...plotForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlotModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Petak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Penanaman Baru */}
      {isAddPlantingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Catat Penanaman di Petak</h3>
              <button
                onClick={() => setIsAddPlantingModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlanting} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pilih Petak *
                </label>
                <select
                  required
                  value={plantingForm.plotId}
                  onChange={(e) => setPlantingForm({ ...plantingForm, plotId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {plotsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.size} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pilih Tanaman dari Katalog *
                </label>
                <select
                  required
                  value={plantingForm.cropId}
                  onChange={(e) => setPlantingForm({ ...plantingForm, cropId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {cropsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.commonName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tanggal Tanam *
                  </label>
                  <input
                    type="date"
                    required
                    value={plantingForm.startDate}
                    onChange={(e) => setPlantingForm({ ...plantingForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Status Penanaman
                  </label>
                  <select
                    value={plantingForm.status}
                    onChange={(e) => setPlantingForm({ ...plantingForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="ditanam">Sedang Ditanam</option>
                    <option value="direncanakan">Direncanakan</option>
                    <option value="dipanen">Sudah Dipanen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Tanam (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Benih varietas F1, perlakuan pupuk kandang matang..."
                  value={plantingForm.notes}
                  onChange={(e) => setPlantingForm({ ...plantingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlantingModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Riwayat Tanam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

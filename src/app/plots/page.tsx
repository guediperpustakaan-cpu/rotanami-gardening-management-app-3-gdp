"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  Layers,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sprout,
  FlaskConical,
  Sun,
  X,
} from "lucide-react";
import { PlantingStatusBadge, PhStatusBadge } from "@/components/Badges";
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
  observationsCount: number;
}

export default function PlotsPage() {
  const { activeFarm } = useApp();
  const { showToast } = useToast();

  const [plots, setPlots] = useState<EnrichedPlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plotForm, setPlotForm] = useState({
    name: "",
    size: "15",
    unit: "m²",
    soilType: "Lempung berpasir",
    sunlight: "Penuh (>6 jam)",
    notes: "",
    status: "aktif",
  });

  const fetchPlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/plots");
      const json = await res.json();
      if (json.success) {
        setPlots(json.data || []);
      }
    } catch {
      showToast("Gagal memuat daftar petak", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots, activeFarm?.id]);

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
          status: "aktif",
        });
        await fetchPlots();
      } else {
        showToast(json.error || "Gagal membuat petak", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch =
      plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plot.soilType && plot.soilType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plot.currentOrLatestPlanting?.cropName &&
        plot.currentOrLatestPlanting.cropName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : plot.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Petak & Bedeng Kebun
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {plots.length} Petak
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Kelola area tanam, ukuran, jenis tanah, dan pantau riwayat tanaman per petak.
          </p>
        </div>
        <button
          onClick={() => setIsAddPlotModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Petak Baru</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama petak, tanah, atau tanaman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Petak Aktif</option>
            <option value="istirahat">Petak Istirahat / Diberakan</option>
          </select>
        </div>
      </div>

      {/* Plot List Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Memuat data petak...</div>
      ) : filteredPlots.length === 0 ? (
        <EmptyState
          title={searchQuery ? "Tidak ada petak yang sesuai pencarian" : "Belum ada petak yang dibuat"}
          description={
            searchQuery
              ? "Coba kata kunci pencarian lain atau bersihkan filter."
              : "Buat petak kebun pertama Anda untuk mulai mencatat riwayat tanam dan merencanakan rotasi."
          }
          action={
            searchQuery
              ? { label: "Bersihkan Pencarian", onClick: () => setSearchQuery("") }
              : { label: "Tambah Petak Sekarang", onClick: () => setIsAddPlotModalOpen(true) }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlots.map((plot) => {
            const latest = plot.currentOrLatestPlanting;
            return (
              <div
                key={plot.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-stone-900 text-lg leading-tight">
                        {plot.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span className="font-medium text-stone-700">
                          {plot.size} {plot.unit}
                        </span>
                        <span>•</span>
                        <span>{plot.soilType || "Tanah belum ditentukan"}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        plot.status === "aktif"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {plot.status === "aktif" ? "Aktif" : "Istirahat"}
                    </span>
                  </div>

                  {/* Info Ringkas Tanah & Sinar */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{plot.sunlight || "Cahaya normal"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate justify-end">
                      <FlaskConical className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <PhStatusBadge ph={plot.latestSoilTest?.ph} />
                    </div>
                  </div>

                  {/* Riwayat Tanaman Terakhir */}
                  <div className="border-t border-stone-100 pt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Tanaman Saat Ini / Terakhir:</span>
                      {latest && <PlantingStatusBadge status={latest.status} />}
                    </div>

                    {latest ? (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/60 space-y-1">
                        <p className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Sprout className="w-4 h-4 text-emerald-700" />
                          <span>{latest.cropName}</span>
                        </p>
                        <p className="text-xs text-stone-500">
                          Mulai: <span className="font-medium text-stone-700">{latest.startDate}</span> • {latest.familyName || "Tanaman"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-stone-50 text-xs text-stone-400 italic">
                        Belum ada riwayat tanaman tercatat.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {plot.observationsCount} observasi
                  </span>
                  <Link
                    href={`/plots/${plot.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    <span>Buka Detail & Riwayat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                  placeholder="Contoh: Bedeng A (Timur - Terik)"
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
    </div>
  );
}

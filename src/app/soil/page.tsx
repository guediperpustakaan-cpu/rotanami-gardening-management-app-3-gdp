"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import {
  FlaskConical,
  Download,
  Plus,
  Info,
  TrendingUp,
  Layers,
  Calendar,
  AlertCircle,
  X,
} from "lucide-react";
import { PhStatusBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { SoilChart } from "@/components/SoilChart";

interface SoilTestRecord {
  id: string;
  plotId: string;
  plotName: string;
  testDate: string;
  ph?: string | null;
  nitrogenPpm?: string | null;
  nitrogenCategory?: string | null;
  phosphorusPpm?: string | null;
  phosphorusCategory?: string | null;
  potassiumPpm?: string | null;
  potassiumCategory?: string | null;
  organicMatterPercent?: string | null;
  testMethod?: string | null;
  notes?: string | null;
}

interface PlotOption {
  id: string;
  name: string;
}

export default function SoilHealthPage() {
  const { showToast } = useToast();

  const [tests, setTests] = useState<SoilTestRecord[]>([]);
  const [plots, setPlots] = useState<PlotOption[]>([]);
  const [selectedPlotFilter, setSelectedPlotFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    plotId: "",
    testDate: new Date().toISOString().slice(0, 10),
    ph: "",
    nitrogenPpm: "",
    nitrogenCategory: "",
    phosphorusPpm: "",
    phosphorusCategory: "",
    potassiumPpm: "",
    potassiumCategory: "",
    organicMatterPercent: "",
    testMethod: "Kit Uji Cepat Mandiri",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [testsRes, plotsRes] = await Promise.all([
        fetch("/api/soil-tests"),
        fetch("/api/plots"),
      ]);

      const [testsJson, plotsJson] = await Promise.all([
        testsRes.json(),
        plotsRes.json(),
      ]);

      if (testsJson.success) setTests(testsJson.data || []);
      if (plotsJson.success && plotsJson.data) {
        setPlots(plotsJson.data);
        if (plotsJson.data.length > 0 && !form.plotId) {
          setForm((prev) => ({ ...prev, plotId: plotsJson.data[0].id }));
        }
      }
    } catch {
      showToast("Gagal memuat data uji tanah", "error");
    } finally {
      setIsLoading(false);
    }
  }, [form.plotId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plotId) {
      showToast("Pilih petak kebun", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        ph: form.ph ? Number(form.ph) : null,
        nitrogenPpm: form.nitrogenPpm ? Number(form.nitrogenPpm) : null,
        phosphorusPpm: form.phosphorusPpm ? Number(form.phosphorusPpm) : null,
        potassiumPpm: form.potassiumPpm ? Number(form.potassiumPpm) : null,
        organicMatterPercent: form.organicMatterPercent ? Number(form.organicMatterPercent) : null,
      };

      const res = await fetch("/api/soil-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Hasil uji tanah berhasil disimpan", "success");
        setIsAddModalOpen(false);
        setForm({
          plotId: plots[0]?.id || "",
          testDate: new Date().toISOString().slice(0, 10),
          ph: "",
          nitrogenPpm: "",
          nitrogenCategory: "",
          phosphorusPpm: "",
          phosphorusCategory: "",
          potassiumPpm: "",
          potassiumCategory: "",
          organicMatterPercent: "",
          testMethod: "Kit Uji Cepat Mandiri",
          notes: "",
        });
        await fetchData();
      } else {
        showToast(json.error || "Gagal menyimpan hasil uji", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    return selectedPlotFilter === "all" ? true : t.plotId === selectedPlotFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Catatan Kesehatan Tanah
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {tests.length} Uji Tercatat
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Pantau tingkat kemasaman (pH) tanah dan status unsur hara makro (N, P, K).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/export/csv?type=soil_tests"
            download
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Ekspor CSV</span>
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Uji Tanah</span>
          </button>
        </div>
      </div>

      {/* Agronomic Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm">Prinsip Kejujuran Data Tanah Rotanami:</strong>
          <p className="leading-relaxed">
            Aplikasi ini hanya menampilkan data riil yang Anda masukkan dan tidak mengarang estimasi hara buatan. Hasil uji tanah bersifat referensi umum dan tidak menggantikan rekomendasi pemupukan laboratorium resmi balai penelitian pertanian setempat.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
          <Layers className="w-4 h-4 text-stone-400" />
          <span>Filter Petak:</span>
          <select
            value={selectedPlotFilter}
            onChange={(e) => setSelectedPlotFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Petak Kebun ({tests.length} data)</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Soil Chart */}
      <SoilChart
        data={filteredTests}
        title={
          selectedPlotFilter === "all"
            ? "Grafik pH Seluruh Kebun"
            : `Grafik pH Petak Terpilih`
        }
      />

      {/* Soil Records List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Memuat riwayat uji tanah...</div>
      ) : filteredTests.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat uji tanah"
          description="Catat hasil pengukuran pH meter atau uji warna NPK pertama Anda."
          action={{
            label: "Catat Hasil Uji Tanah",
            onClick: () => setIsAddModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-base">
                      {test.plotName}
                    </h3>
                    <PhStatusBadge ph={test.ph} />
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Tanggal Pengujian: <strong className="text-stone-700">{test.testDate}</strong> • Metode: {test.testMethod || "Uji Mandiri"}
                  </p>
                </div>
              </div>

              {/* NPK Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-500 block">Nitrogen (N):</span>
                  <strong className="text-stone-800">
                    {test.nitrogenPpm ? `${test.nitrogenPpm} ppm` : "-"}
                    {test.nitrogenCategory && ` (${test.nitrogenCategory})`}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Fosfor (P):</span>
                  <strong className="text-stone-800">
                    {test.phosphorusPpm ? `${test.phosphorusPpm} ppm` : "-"}
                    {test.phosphorusCategory && ` (${test.phosphorusCategory})`}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Kalium (K):</span>
                  <strong className="text-stone-800">
                    {test.potassiumPpm ? `${test.potassiumPpm} ppm` : "-"}
                    {test.potassiumCategory && ` (${test.potassiumCategory})`}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Bahan Organik:</span>
                  <strong className="text-stone-800">
                    {test.organicMatterPercent ? `${test.organicMatterPercent}%` : "-"}
                  </strong>
                </div>
              </div>

              {test.notes && (
                <p className="text-xs text-stone-600 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100">
                  <strong>Catatan:</strong> {test.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Uji Tanah */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Catat Hasil Uji Tanah Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTest} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pilih Petak Kebun *
                </label>
                <select
                  required
                  value={form.plotId}
                  onChange={(e) => setForm({ ...form, plotId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tanggal Uji *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.testDate}
                    onChange={(e) => setForm({ ...form, testDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nilai pH (0.0 - 14.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    placeholder="Contoh: 6.5"
                    value={form.ph}
                    onChange={(e) => setForm({ ...form, ph: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Kategori N
                  </label>
                  <select
                    value={form.nitrogenCategory}
                    onChange={(e) => setForm({ ...form, nitrogenCategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                  >
                    <option value="">Tidak diuji</option>
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Kategori P
                  </label>
                  <select
                    value={form.phosphorusCategory}
                    onChange={(e) => setForm({ ...form, phosphorusCategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                  >
                    <option value="">Tidak diuji</option>
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Kategori K
                  </label>
                  <select
                    value={form.potassiumCategory}
                    onChange={(e) => setForm({ ...form, potassiumCategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                  >
                    <option value="">Tidak diuji</option>
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Bahan Organik (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Contoh: 3.2"
                    value={form.organicMatterPercent}
                    onChange={(e) => setForm({ ...form, organicMatterPercent: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Metode Uji / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kit Warna Mandiri NPK"
                    value={form.testMethod}
                    onChange={(e) => setForm({ ...form, testMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Tanah (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tanah agak berpasir, diberi pupuk kandang matang..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Hasil Uji"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

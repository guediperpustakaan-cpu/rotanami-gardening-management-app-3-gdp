"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Calendar,
  Sprout,
  FlaskConical,
  Eye,
  Plus,
  Trash2,
  Edit2,
  RotateCw,
  Sun,
  Layers,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { NutrientCategoryBadge, PlantingStatusBadge, PhStatusBadge } from "@/components/Badges";
import { SoilChart } from "@/components/SoilChart";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";

interface PlotDetail {
  id: string;
  name: string;
  size: string;
  unit: string;
  soilType?: string | null;
  sunlight?: string | null;
  notes?: string | null;
  status: string;
  plantings: Array<{
    id: string;
    cropId: string;
    cropName: string;
    scientificName?: string | null;
    familyName?: string | null;
    familyCommonName?: string | null;
    nutrientCategory: string;
    startDate: string;
    harvestDate?: string | null;
    status: string;
    harvestYield?: string | null;
    yieldUnit?: string | null;
    notes?: string | null;
  }>;
  soilTests: Array<{
    id: string;
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
  }>;
  observations: Array<{
    id: string;
    category: string;
    date: string;
    severity?: string | null;
    description: string;
    actionTaken?: string | null;
    cropName?: string | null;
  }>;
  rotationPlans: Array<{
    id: string;
    seasonName: string;
    targetPeriod: string;
    plannedCropId: string;
    cropName: string;
    status: string;
    recommendationReason: string;
    notes?: string | null;
  }>;
}

interface CropCatalogItem {
  id: string;
  commonName: string;
}

export default function PlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plotId = params.id as string;
  const { showToast } = useToast();

  const [plot, setPlot] = useState<PlotDetail | null>(null);
  const [cropsCatalog, setCropsCatalog] = useState<CropCatalogItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "riwayat" | "tanah" | "observasi">("ringkasan");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditPlotOpen, setIsEditPlotOpen] = useState(false);
  const [isDeletePlotOpen, setIsDeletePlotOpen] = useState(false);
  const [isAddPlantingOpen, setIsAddPlantingOpen] = useState(false);
  const [isAddSoilTestOpen, setIsAddSoilTestOpen] = useState(false);
  const [isAddObservationOpen, setIsAddObservationOpen] = useState(false);

  // Deletion target for single planting
  const [deletingPlantingId, setDeletingPlantingId] = useState<string | null>(null);

  // Form states
  const [plotForm, setPlotForm] = useState({
    name: "",
    size: "15",
    unit: "m²",
    soilType: "",
    sunlight: "",
    notes: "",
    status: "aktif",
  });

  const [plantingForm, setPlantingForm] = useState({
    cropId: "",
    startDate: new Date().toISOString().slice(0, 10),
    harvestDate: "",
    status: "ditanam",
    harvestYield: "",
    yieldUnit: "kg",
    notes: "",
  });

  const [soilForm, setSoilForm] = useState({
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

  const [obsForm, setObsForm] = useState({
    category: "pertumbuhan",
    date: new Date().toISOString().slice(0, 10),
    severity: "ringan",
    description: "",
    actionTaken: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlotDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plotRes, cropsRes] = await Promise.all([
        fetch(`/api/plots/${plotId}`),
        fetch("/api/crops"),
      ]);

      const [plotJson, cropsJson] = await Promise.all([
        plotRes.json(),
        cropsRes.json(),
      ]);

      if (plotJson.success && plotJson.data) {
        setPlot(plotJson.data);
        setPlotForm({
          name: plotJson.data.name,
          size: plotJson.data.size,
          unit: plotJson.data.unit,
          soilType: plotJson.data.soilType || "",
          sunlight: plotJson.data.sunlight || "",
          notes: plotJson.data.notes || "",
          status: plotJson.data.status || "aktif",
        });
      } else {
        showToast("Petak tidak ditemukan", "error");
        router.push("/plots");
      }

      if (cropsJson.success) {
        setCropsCatalog(cropsJson.data || []);
        if (cropsJson.data && cropsJson.data.length > 0 && !plantingForm.cropId) {
          setPlantingForm((prev) => ({ ...prev, cropId: cropsJson.data[0].id }));
        }
      }
    } catch {
      showToast("Gagal memuat detail petak", "error");
    } finally {
      setIsLoading(false);
    }
  }, [plotId, router, showToast, plantingForm.cropId]);

  useEffect(() => {
    fetchPlotDetail();
  }, [fetchPlotDetail]);

  const handleUpdatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/plots/${plotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plotForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Data petak berhasil diperbarui", "success");
        setIsEditPlotOpen(false);
        await fetchPlotDetail();
      } else {
        showToast(json.error || "Gagal memperbarui petak", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlot = async () => {
    try {
      const res = await fetch(`/api/plots/${plotId}?force=true`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Petak berhasil dihapus", "success");
        router.push("/plots");
      } else {
        showToast(json.error || "Gagal menghapus petak", "error");
      }
    } catch {
      showToast("Gagal menghapus petak", "error");
    }
  };

  const handleCreatePlanting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantingForm.cropId) {
      showToast("Pilih jenis tanaman", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        plotId,
        ...plantingForm,
        harvestYield: plantingForm.harvestYield ? Number(plantingForm.harvestYield) : null,
      };
      const res = await fetch("/api/plantings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Riwayat tanam berhasil ditambahkan", "success");
        setIsAddPlantingOpen(false);
        setPlantingForm((prev) => ({
          ...prev,
          notes: "",
          harvestYield: "",
        }));
        await fetchPlotDetail();
      } else {
        showToast(json.error || "Gagal menyimpan riwayat tanam", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlanting = async (plantingId: string) => {
    try {
      const res = await fetch(`/api/plantings/${plantingId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("Catatan riwayat tanam berhasil dihapus", "success");
        setDeletingPlantingId(null);
        await fetchPlotDetail();
      } else {
        showToast(json.error || "Gagal menghapus riwayat tanam", "error");
      }
    } catch {
      showToast("Gagal menghapus catatan", "error");
    }
  };

  const handleCreateSoilTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        plotId,
        testDate: soilForm.testDate,
        ph: soilForm.ph ? Number(soilForm.ph) : null,
        nitrogenPpm: soilForm.nitrogenPpm ? Number(soilForm.nitrogenPpm) : null,
        nitrogenCategory: soilForm.nitrogenCategory || null,
        phosphorusPpm: soilForm.phosphorusPpm ? Number(soilForm.phosphorusPpm) : null,
        phosphorusCategory: soilForm.phosphorusCategory || null,
        potassiumPpm: soilForm.potassiumPpm ? Number(soilForm.potassiumPpm) : null,
        potassiumCategory: soilForm.potassiumCategory || null,
        organicMatterPercent: soilForm.organicMatterPercent ? Number(soilForm.organicMatterPercent) : null,
        testMethod: soilForm.testMethod || null,
        notes: soilForm.notes || null,
      };

      const res = await fetch("/api/soil-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Hasil uji tanah berhasil disimpan", "success");
        setIsAddSoilTestOpen(false);
        setSoilForm({
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
        await fetchPlotDetail();
      } else {
        showToast(json.error || "Gagal menyimpan uji tanah", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsForm.description.trim()) {
      showToast("Deskripsi observasi wajib diisi", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        plotId,
        category: obsForm.category,
        date: obsForm.date,
        severity: obsForm.severity,
        description: obsForm.description,
        actionTaken: obsForm.actionTaken || null,
      };

      const res = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Catatan observasi berhasil ditambahkan", "success");
        setIsAddObservationOpen(false);
        setObsForm({
          category: "pertumbuhan",
          date: new Date().toISOString().slice(0, 10),
          severity: "ringan",
          description: "",
          actionTaken: "",
        });
        await fetchPlotDetail();
      } else {
        showToast(json.error || "Gagal menyimpan observasi", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !plot) {
    return <div className="p-12 text-center text-stone-500">Memuat detail petak...</div>;
  }

  const latestPlanting = plot.plantings[0] || null;
  const latestSoilTest = plot.soilTests[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/plots"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shrink-0"
            aria-label="Kembali ke daftar petak"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif">
                {plot.name}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  plot.status === "aktif"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {plot.status === "aktif" ? "Petak Aktif" : "Istirahat"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Luas {plot.size} {plot.unit} • {plot.soilType || "Jenis tanah belum diisi"} • {plot.sunlight || "Cahaya normal"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/rotation?plotId=${plot.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Saran Rotasi</span>
          </Link>
          <button
            onClick={() => setIsEditPlotOpen(true)}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl"
            title="Ubah Profil Petak"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeletePlotOpen(true)}
            className="p-2 text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-stone-200 rounded-xl"
            title="Hapus Petak"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-stone-200 flex items-center gap-2 sm:gap-6 overflow-x-auto text-sm font-semibold text-stone-500">
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "ringkasan"
              ? "border-emerald-700 text-emerald-900"
              : "border-transparent hover:text-stone-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab("riwayat")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "riwayat"
              ? "border-emerald-700 text-emerald-900"
              : "border-transparent hover:text-stone-800"
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Riwayat Tanam ({plot.plantings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tanah")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "tanah"
              ? "border-emerald-700 text-emerald-900"
              : "border-transparent hover:text-stone-800"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Kesehatan Tanah ({plot.soilTests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("observasi")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "observasi"
              ? "border-emerald-700 text-emerald-900"
              : "border-transparent hover:text-stone-800"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Observasi ({plot.observations.length})</span>
        </button>
      </div>

      {/* TAB 1: RINGKASAN */}
      {activeTab === "ringkasan" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Status Tanaman Saat Ini */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-base">Status Budidaya Terkini</h3>
                {latestPlanting && <PlantingStatusBadge status={latestPlanting.status} />}
              </div>

              {latestPlanting ? (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                        Tanaman Aktif
                      </p>
                      <h4 className="text-lg font-extrabold text-stone-900 mt-0.5">
                        {latestPlanting.cropName}
                      </h4>
                      {latestPlanting.scientificName && (
                        <p className="text-xs italic text-stone-500">
                          {latestPlanting.scientificName}
                        </p>
                      )}
                    </div>
                    <NutrientCategoryBadge category={latestPlanting.nutrientCategory} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-emerald-100">
                    <div>
                      <span className="text-stone-500 block">Tanggal Tanam:</span>
                      <strong className="text-stone-900">{latestPlanting.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Keluarga Botani:</span>
                      <strong className="text-stone-900">{latestPlanting.familyName || "Umum"}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Tanggal Panen:</span>
                      <strong className="text-stone-900">{latestPlanting.harvestDate || "Belum panen"}</strong>
                    </div>
                  </div>

                  {latestPlanting.notes && (
                    <p className="text-xs text-stone-600 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                      <strong>Catatan:</strong> {latestPlanting.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                  <p className="text-sm font-semibold text-stone-700">Belum ada riwayat tanaman</p>
                  <p className="text-xs text-stone-500">
                    Petak ini belum ditanami. Anda dapat meminta saran rotasi pemula atau mencatat tanaman sekarang.
                  </p>
                  <button
                    onClick={() => setIsAddPlantingOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Catat Tanaman Pertama
                  </button>
                </div>
              )}
            </div>

            {/* Riwayat Rotasi Terjadwal */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-base">Rencana Rotasi Tersimpan</h3>
                <Link
                  href={`/rotation?plotId=${plot.id}`}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  + Buat / Analisis Rencana Baru
                </Link>
              </div>

              {plot.rotationPlans.length === 0 ? (
                <p className="text-xs text-stone-500 py-3">
                  Belum ada rencana rotasi tersimpan untuk petak ini. Gunakan fitur Perencana Rotasi untuk merencanakan musim berikutnya secara ilmiah.
                </p>
              ) : (
                <div className="space-y-3">
                  {plot.rotationPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">
                          {plan.seasonName} ({plan.targetPeriod})
                        </span>
                        <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                          {plan.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700">
                        Tanaman Rencana: <strong className="text-emerald-800 font-bold">{plan.cropName}</strong>
                      </p>
                      {plan.notes && (
                        <p className="text-[11px] text-stone-500 italic">{plan.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Karakteristik Petak */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-sm">Informasi Fisik Petak</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Ukuran Luas</span>
                  <span className="font-bold text-stone-900">{plot.size} {plot.unit}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Jenis Tanah</span>
                  <span className="font-bold text-stone-900">{plot.soilType || "Belum diuji"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Paparan Sinar</span>
                  <span className="font-bold text-stone-900">{plot.sunlight || "Normal"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">pH Terakhir</span>
                  <PhStatusBadge ph={latestSoilTest?.ph} />
                </div>
              </div>

              {plot.notes && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-stone-700 mb-1">Catatan Khusus Petak:</p>
                  <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                    {plot.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick action button box */}
            <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
              <h4 className="font-bold text-sm">Tindakan Cepat Petak</h4>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Catat kemajuan atau buat observasi hama/penyakit seketika di lapangan.
              </p>
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setIsAddPlantingOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Catat Siklus Tanam
                </button>
                <button
                  onClick={() => setIsAddSoilTestOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-semibold transition-colors border border-emerald-700/60"
                >
                  <FlaskConical className="w-3.5 h-3.5" /> Catat Hasil Uji Tanah
                </button>
                <button
                  onClick={() => setIsAddObservationOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-semibold transition-colors border border-emerald-700/60"
                >
                  <Eye className="w-3.5 h-3.5" /> Catat Observasi Hama/Cuaca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT TANAM */}
      {activeTab === "riwayat" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Riwayat Penanaman Kronologis</h3>
              <p className="text-xs text-stone-500">Urut dari penanaman terbaru</p>
            </div>
            <button
              onClick={() => setIsAddPlantingOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Catatan Tanam
            </button>
          </div>

          {plot.plantings.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat tanam"
              description="Catat tanaman yang sedang atau pernah ditanam di petak ini untuk memulai rekam jejak rotasi."
              action={{
                label: "Catat Tanaman Pertama",
                onClick: () => setIsAddPlantingOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {plot.plantings.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        #{plot.plantings.length - idx}
                      </span>
                      <h4 className="font-bold text-stone-900 text-base">
                        {p.cropName}
                      </h4>
                      <PlantingStatusBadge status={p.status} />
                      <NutrientCategoryBadge category={p.nutrientCategory} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span>Mulai: <strong className="text-stone-700">{p.startDate}</strong></span>
                      {p.harvestDate && (
                        <span>Panen: <strong className="text-stone-700">{p.harvestDate}</strong></span>
                      )}
                      <span>Keluarga: <strong className="text-stone-700">{p.familyName || "Tanaman"}</strong></span>
                      {p.harvestYield && (
                        <span className="text-emerald-700 font-semibold">
                          Hasil: {p.harvestYield} {p.yieldUnit || "kg"}
                        </span>
                      )}
                    </div>

                    {p.notes && (
                      <p className="text-xs text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                        {p.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDeletingPlantingId(p.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus riwayat ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KESEHATAN TANAH */}
      {activeTab === "tanah" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Catatan Hasil Uji Kesehatan Tanah</h3>
              <p className="text-xs text-stone-500">Pantau pH dan status hara N, P, K secara berkala</p>
            </div>
            <button
              onClick={() => setIsAddSoilTestOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Catat Hasil Uji Tanah
            </button>
          </div>

          {/* Visual Chart */}
          <SoilChart data={plot.soilTests} title={`Perkembangan pH Tanah ${plot.name}`} />

          {/* Table / List of Tests */}
          {plot.soilTests.length === 0 ? (
            <EmptyState
              title="Belum ada catatan uji tanah"
              description="Lakukan tes pH mandiri atau analisis laboratorium lalu catat hasilnya untuk menjaga kesuburan petak ini."
              action={{
                label: "Catat Uji Tanah Sekarang",
                onClick: () => setIsAddSoilTestOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {plot.soilTests.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">
                            Tanggal Uji: {t.testDate}
                          </span>
                          <PhStatusBadge ph={t.ph} />
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Metode: {t.testMethod || "Uji Mandiri"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NPK Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-500 block">Nitrogen (N):</span>
                      <strong className="text-stone-800">
                        {t.nitrogenPpm ? `${t.nitrogenPpm} ppm` : "-"}
                        {t.nitrogenCategory && ` (${t.nitrogenCategory})`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Fosfor (P):</span>
                      <strong className="text-stone-800">
                        {t.phosphorusPpm ? `${t.phosphorusPpm} ppm` : "-"}
                        {t.phosphorusCategory && ` (${t.phosphorusCategory})`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Kalium (K):</span>
                      <strong className="text-stone-800">
                        {t.potassiumPpm ? `${t.potassiumPpm} ppm` : "-"}
                        {t.potassiumCategory && ` (${t.potassiumCategory})`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Bahan Organik:</span>
                      <strong className="text-stone-800">
                        {t.organicMatterPercent ? `${t.organicMatterPercent}%` : "-"}
                      </strong>
                    </div>
                  </div>

                  {t.notes && (
                    <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                      <strong>Catatan Petugas/Pekebun:</strong> {t.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OBSERVASI */}
      {activeTab === "observasi" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Catatan Observasi Lapangan</h3>
              <p className="text-xs text-stone-500">
                Temuan hama, gejala penyakit, pertumbuhan, atau cuaca ekstrem
              </p>
            </div>
            <button
              onClick={() => setIsAddObservationOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Observasi
            </button>
          </div>

          {plot.observations.length === 0 ? (
            <EmptyState
              title="Belum ada catatan observasi"
              description="Catat pengamatan visual lapangan seperti kemunculan serangga, daun menguning, atau pertumbuhan tunas baru."
              action={{
                label: "Catat Observasi Sekarang",
                onClick: () => setIsAddObservationOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {plot.observations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {obs.category}
                      </span>
                      <span className="text-xs text-stone-500">{obs.date}</span>
                      {obs.severity && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            obs.severity === "berat"
                              ? "bg-rose-100 text-rose-800"
                              : obs.severity === "sedang"
                              ? "bg-amber-100 text-amber-800"
                              : obs.severity === "positif"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          Tingkat: {obs.severity}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-stone-800 leading-relaxed font-medium">
                    {obs.description}
                  </p>

                  {obs.actionTaken && (
                    <div className="text-xs text-stone-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <strong className="text-emerald-900">Tindakan Penanganan:</strong> {obs.actionTaken}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Edit Profil Petak */}
      {isEditPlotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Ubah Profil Petak</h3>
              <button
                onClick={() => setIsEditPlotOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlot} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Petak *
                </label>
                <input
                  type="text"
                  required
                  value={plotForm.name}
                  onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Ukuran Luas
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
                    <option value="m²">m²</option>
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
                  <input
                    type="text"
                    value={plotForm.soilType}
                    onChange={(e) => setPlotForm({ ...plotForm, soilType: e.target.value })}
                    placeholder="Contoh: Lempung berpasir"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Pencahayaan Sinar
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
                  Status Petak
                </label>
                <select
                  value={plotForm.status}
                  onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="aktif">Aktif Digunakan</option>
                  <option value="istirahat">Istirahat / Diberakan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Petak
                </label>
                <textarea
                  rows={2}
                  value={plotForm.notes}
                  onChange={(e) => setPlotForm({ ...plotForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPlotOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Riwayat Tanam */}
      {isAddPlantingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Catat Siklus Tanam di {plot.name}</h3>
              <button
                onClick={() => setIsAddPlantingOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlanting} className="p-5 space-y-4">
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
                  {cropsCatalog.map((c) => (
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
                    Status Tanam
                  </label>
                  <select
                    value={plantingForm.status}
                    onChange={(e) => setPlantingForm({ ...plantingForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="ditanam">Sedang Ditanam</option>
                    <option value="dipanen">Sudah Dipanen</option>
                    <option value="direncanakan">Direncanakan</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {plantingForm.status === "dipanen" && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Tanggal Panen
                    </label>
                    <input
                      type="date"
                      value={plantingForm.harvestDate}
                      onChange={(e) => setPlantingForm({ ...plantingForm, harvestDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Jumlah Hasil
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Misal: 25.5"
                      value={plantingForm.harvestYield}
                      onChange={(e) => setPlantingForm({ ...plantingForm, harvestYield: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Satuan
                    </label>
                    <select
                      value={plantingForm.yieldUnit}
                      onChange={(e) => setPlantingForm({ ...plantingForm, yieldUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                    >
                      <option value="kg">kg</option>
                      <option value="ikat">ikat</option>
                      <option value="buah">buah</option>
                      <option value="gram">gram</option>
                      <option value="ton">ton</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Khusus Penanaman
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Asal benih, jarak tanam 30x40, mulsa jerami..."
                  value={plantingForm.notes}
                  onChange={(e) => setPlantingForm({ ...plantingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlantingOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Penanaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Hasil Uji Tanah */}
      {isAddSoilTestOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Catat Hasil Uji Tanah</h3>
              <button
                onClick={() => setIsAddSoilTestOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSoilTest} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tanggal Uji *
                  </label>
                  <input
                    type="date"
                    required
                    value={soilForm.testDate}
                    onChange={(e) => setSoilForm({ ...soilForm, testDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    pH Tanah (3.0 - 9.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    placeholder="Contoh: 6.5"
                    value={soilForm.ph}
                    onChange={(e) => setSoilForm({ ...soilForm, ph: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Status Nitrogen (N)
                  </label>
                  <select
                    value={soilForm.nitrogenCategory}
                    onChange={(e) => setSoilForm({ ...soilForm, nitrogenCategory: e.target.value })}
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
                    Status Fosfor (P)
                  </label>
                  <select
                    value={soilForm.phosphorusCategory}
                    onChange={(e) => setSoilForm({ ...soilForm, phosphorusCategory: e.target.value })}
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
                    Status Kalium (K)
                  </label>
                  <select
                    value={soilForm.potassiumCategory}
                    onChange={(e) => setSoilForm({ ...soilForm, potassiumCategory: e.target.value })}
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
                    placeholder="Contoh: 3.5"
                    value={soilForm.organicMatterPercent}
                    onChange={(e) => setSoilForm({ ...soilForm, organicMatterPercent: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Metode Uji / Laboratorium
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kit Warna NPK / Lab Dinas"
                    value={soilForm.testMethod}
                    onChange={(e) => setSoilForm({ ...soilForm, testMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Tanah
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Perlu tambahan kapur dolomit 150g/m²..."
                  value={soilForm.notes}
                  onChange={(e) => setSoilForm({ ...soilForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSoilTestOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Uji Tanah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Observasi Lapangan */}
      {isAddObservationOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Catat Observasi Lapangan</h3>
              <button
                onClick={() => setIsAddObservationOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateObservation} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Jenis Observasi *
                  </label>
                  <select
                    value={obsForm.category}
                    onChange={(e) => setObsForm({ ...obsForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  >
                    <option value="hama">Hama (Serangga / Kutu / Ulat)</option>
                    <option value="penyakit">Penyakit (Jamur / Bakteri / Virus)</option>
                    <option value="pertumbuhan">Pertumbuhan / Vigor Tanaman</option>
                    <option value="cuaca">Cuaca / Suhu / Curah Hujan</option>
                    <option value="kesuburan">Kesuburan / Struktur Tanah</option>
                    <option value="catatan_lain">Catatan Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tanggal Pengamatan *
                  </label>
                  <input
                    type="date"
                    required
                    value={obsForm.date}
                    onChange={(e) => setObsForm({ ...obsForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tingkat / Tingkat Keparahan
                </label>
                <select
                  value={obsForm.severity}
                  onChange={(e) => setObsForm({ ...obsForm, severity: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                >
                  <option value="ringan">Ringan (Gejala awal / spot kecil)</option>
                  <option value="sedang">Sedang (Menyebar pada beberapa tanaman)</option>
                  <option value="berat">Berat (Perlu penanganan segera)</option>
                  <option value="positif">Positif / Sangat Baik</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Deskripsi Pengamatan *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Misal: Ditemukan kutu kebul di balik daun muda tanaman cabai, daun mulai menggulung..."
                  value={obsForm.description}
                  onChange={(e) => setObsForm({ ...obsForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tindakan Penanganan yang Dilakukan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Semprot pestisida nabati rebusan daun tembakau dan mimba..."
                  value={obsForm.actionTaken}
                  onChange={(e) => setObsForm({ ...obsForm, actionTaken: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddObservationOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Observasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Planting */}
      <ConfirmModal
        isOpen={Boolean(deletingPlantingId)}
        title="Hapus Catatan Riwayat Tanam"
        message="Apakah Anda yakin ingin menghapus catatan penanaman ini? Data yang dihapus tidak dapat dipulihkan."
        confirmText="Hapus Catatan"
        onConfirm={() => deletingPlantingId && handleDeletePlanting(deletingPlantingId)}
        onClose={() => setDeletingPlantingId(null)}
      />

      {/* Confirmation Modal: Delete Entire Plot (Protected Typed Confirmation) */}
      <ConfirmModal
        isOpen={isDeletePlotOpen}
        title={`Hapus Petak "${plot.name}"`}
        message={`Perhatian: Menghapus petak ini akan menghapus ${plot.plantings.length} riwayat tanam, ${plot.soilTests.length} hasil uji tanah, dan ${plot.observations.length} observasi terkait. Pastikan Anda tidak memerlukan data ini lagi.`}
        confirmText="Hapus Petak Selamanya"
        requiresTypeConfirm={plot.plantings.length > 0}
        typeMatchWord="HAPUS"
        onConfirm={handleDeletePlot}
        onClose={() => setIsDeletePlotOpen(false)}
      />
    </div>
  );
}

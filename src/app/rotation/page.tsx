"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sprout,
  ArrowRight,
  ShieldAlert,
  Save,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { NutrientCategoryBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { RotationEvaluationResult, RotationSuggestionItem, CropData } from "@/lib/rotation-engine";

interface PlotItem {
  id: string;
  name: string;
  size: string;
  unit: string;
  soilType?: string | null;
}

interface SavedPlan {
  id: string;
  plotId: string;
  plotName: string;
  seasonName: string;
  targetPeriod: string;
  plannedCropId: string;
  cropName: string;
  status: string;
  recommendationReason: string;
  notes?: string | null;
  createdAt: string;
}

import { Suspense } from "react";

export default function RotationPlannerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Memuat perencana rotasi...</div>}>
      <RotationPlannerContent />
    </Suspense>
  );
}

function RotationPlannerContent() {
  const searchParams = useSearchParams();
  const initialPlotId = searchParams.get("plotId") || "";
  const { showToast } = useToast();

  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string>(initialPlotId);
  const [targetSeasonName, setTargetSeasonName] = useState("Musim Tanam Lanjutan 2026");
  const [targetPeriod, setTargetPeriod] = useState("Mei - Juli 2026");

  const [evaluation, setEvaluation] = useState<RotationEvaluationResult | null>(null);
  const [allCatalogCrops, setAllCatalogCrops] = useState<CropData[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Form to save plan
  const [selectedCropIdForPlan, setSelectedCropIdForPlan] = useState<string>("");
  const [selectedReasonForPlan, setSelectedReasonForPlan] = useState<string>("");
  const [planNotes, setPlanNotes] = useState<string>("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Fetch initial plots and saved plans
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoadingPlans(true);
      const [plotsRes, plansRes, cropsRes] = await Promise.all([
        fetch("/api/plots"),
        fetch("/api/rotation-plans"),
        fetch("/api/crops"),
      ]);

      const [plotsJson, plansJson, cropsJson] = await Promise.all([
        plotsRes.json(),
        plansRes.json(),
        cropsRes.json(),
      ]);

      if (plotsJson.success && plotsJson.data) {
        setPlots(plotsJson.data);
        if (!selectedPlotId && plotsJson.data.length > 0) {
          setSelectedPlotId(plotsJson.data[0].id);
        }
      }

      if (plansJson.success) {
        setSavedPlans(plansJson.data || []);
      }

      if (cropsJson.success) {
        setAllCatalogCrops(cropsJson.data || []);
      }
    } catch {
      showToast("Gagal memuat data perencana", "error");
    } finally {
      setIsLoadingPlans(false);
    }
  }, [selectedPlotId, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Run evaluation when user triggers
  const handleRunEvaluation = async () => {
    if (!selectedPlotId) {
      showToast("Pilih petak kebun terlebih dahulu", "error");
      return;
    }
    try {
      setIsEvaluating(true);
      const res = await fetch("/api/rotation-plans/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotId: selectedPlotId,
          targetSeasonName,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.evaluation) {
        setEvaluation(json.data.evaluation);
        const top = json.data.evaluation.primarySuggestion;
        if (top) {
          setSelectedCropIdForPlan(top.crop.id);
          setSelectedReasonForPlan(top.reason);
        }
        showToast("Rekomendasi rotasi berhasil dianalisis", "success");
      } else {
        showToast(json.error || "Gagal menganalisis rotasi", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Run auto-evaluation if query param plotId was provided
  useEffect(() => {
    if (initialPlotId && plots.some((p) => p.id === initialPlotId)) {
      handleRunEvaluation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPlotId, plots]);

  const handleSelectSuggestionForPlan = (suggestion: RotationSuggestionItem) => {
    setSelectedCropIdForPlan(suggestion.crop.id);
    setSelectedReasonForPlan(suggestion.reason);
    showToast(`Tanaman ${suggestion.crop.commonName} dipilih untuk rencana`, "info");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlotId || !selectedCropIdForPlan) {
      showToast("Petak dan tanaman rencana wajib dipilih", "error");
      return;
    }
    try {
      setIsSavingPlan(true);
      const payload = {
        plotId: selectedPlotId,
        seasonName: targetSeasonName,
        targetPeriod,
        plannedCropId: selectedCropIdForPlan,
        status: "draf",
        recommendationReason: selectedReasonForPlan || "Dipilih secara manual oleh pengguna",
        notes: planNotes || null,
      };

      const res = await fetch("/api/rotation-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Rencana rotasi berhasil disimpan", "success");
        setPlanNotes("");
        // Refresh plans
        const pRes = await fetch("/api/rotation-plans");
        const pJson = await pRes.json();
        if (pJson.success) setSavedPlans(pJson.data || []);
      } else {
        showToast(json.error || "Gagal menyimpan rencana", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleUpdatePlanStatus = async (planId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rotation-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, status: newStatus } : p))
        );
        showToast(`Status rencana diubah menjadi "${newStatus}"`, "success");
      }
    } catch {
      showToast("Gagal memperbarui status rencana", "error");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch(`/api/rotation-plans/${planId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
        showToast("Rencana rotasi berhasil dihapus", "success");
      }
    } catch {
      showToast("Gagal menghapus rencana rotasi", "error");
    }
  };

  const selectedPlotObj = plots.find((p) => p.id === selectedPlotId);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
            <RotateCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Perencana Rotasi Tanaman
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Saran rotasi berbasis aturan botani, pemutus siklus hama tular-tanah, dan pemulihan hara.
            </p>
          </div>
        </div>
      </div>

      {/* Control Box: Pilih Petak dan Musim */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-bold text-stone-900 text-base">
          1. Tentukan Petak & Periode Rencana
        </h2>

        {plots.length === 0 ? (
          <EmptyState
            title="Belum ada petak yang dibuat"
            description="Tambahkan petak kebun Anda terlebih dahulu sebelum merencanakan rotasi tanaman."
            action={{ label: "Tambah Petak", href: "/plots" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Pilih Petak Kebun *
              </label>
              <select
                value={selectedPlotId}
                onChange={(e) => {
                  setSelectedPlotId(e.target.value);
                  setEvaluation(null);
                }}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.size} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Musim Tanam Rencana
              </label>
              <input
                type="text"
                value={targetSeasonName}
                onChange={(e) => setTargetSeasonName(e.target.value)}
                placeholder="Contoh: Musim Kemarau 2026"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Rentang Waktu / Bulan Target
              </label>
              <input
                type="text"
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(e.target.value)}
                placeholder="Contoh: Mei - Juli 2026"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {plots.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
            <div className="text-xs text-stone-500">
              Petak terpilih: <strong className="text-stone-800">{selectedPlotObj?.name}</strong> • Jenis tanah:{" "}
              {selectedPlotObj?.soilType || "Belum ditentukan"}
            </div>
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{isEvaluating ? "Menganalisis Riwayat..." : "Hitung Rekomendasi Rotasi"}</span>
            </button>
          </div>
        )}
      </div>

      {/* HASIL EVALUASI ROTASI */}
      {evaluation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Status Message Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              evaluation.hasSufficientData
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {evaluation.hasSufficientData ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold text-sm">{evaluation.statusMessage}</p>
              {evaluation.historySummary.lastCropName && (
                <p className="text-xs opacity-90">
                  Tanaman sebelumnya: <strong>{evaluation.historySummary.lastCropName}</strong> ({evaluation.historySummary.lastFamilyName})
                </p>
              )}
            </div>
          </div>

          {/* SARAN UTAMA & ALTERNATIF */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rekomendasi Utama (2 Spans) */}
            {evaluation.primarySuggestion && (
              <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-700 text-white">
                      ★ {evaluation.primarySuggestion.badge}
                    </span>
                    <NutrientCategoryBadge category={evaluation.primarySuggestion.crop.nutrientCategory} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-stone-900 font-serif">
                      {evaluation.primarySuggestion.crop.commonName}
                    </h3>
                    {evaluation.primarySuggestion.crop.scientificName && (
                      <p className="text-sm italic text-stone-500">
                        {evaluation.primarySuggestion.crop.scientificName}
                      </p>
                    )}
                  </div>

                  {/* Penjelasan Logika Rotasi */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="text-xs text-stone-700 leading-relaxed">
                      <strong className="text-emerald-900 block mb-1">Alasan Rekomendasi:</strong>
                      {evaluation.primarySuggestion.reason}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200 text-xs">
                      <div>
                        <span className="text-stone-500 font-medium block">Manfaat Hara:</span>
                        <p className="text-stone-800">{evaluation.primarySuggestion.nutrientBenefit}</p>
                      </div>
                      <div>
                        <span className="text-stone-500 font-medium block">Manfaat Pengendalian Hama:</span>
                        <p className="text-stone-800">{evaluation.primarySuggestion.pestBenefit}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    Keluarga: {evaluation.primarySuggestion.crop.family?.name || "Pangan"}
                  </span>
                  <button
                    onClick={() => evaluation.primarySuggestion && handleSelectSuggestionForPlan(evaluation.primarySuggestion)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Pilih Tanaman Ini untuk Rencana</span>
                  </button>
                </div>
              </div>
            )}

            {/* Alternatif Tanaman Lainnya (1 Span) */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-900 text-sm">Alternatif Lain yang Sehat:</h3>

              {evaluation.alternativeSuggestions.length === 0 ? (
                <p className="text-xs text-stone-400">Tidak ada alternatif tambahan.</p>
              ) : (
                evaluation.alternativeSuggestions.map((alt) => (
                  <div
                    key={alt.crop.id}
                    className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">
                          {alt.crop.commonName}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {alt.crop.family?.name || "Keluarga Lain"}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {alt.badge}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {alt.reason}
                    </p>

                    <button
                      onClick={() => handleSelectSuggestionForPlan(alt)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-1"
                    >
                      Pilih Alternatif Ini <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PERINGATAN: TANAMAN YANG SEBAIKNYA DIHINDARI */}
          {evaluation.discouragedCrops.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
                <h3 className="font-bold text-sm">
                  Tanaman yang Sebaiknya Dihindari untuk Petak Ini:
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluation.discouragedCrops.map((d) => (
                  <div
                    key={d.crop.id}
                    className="p-3 bg-white rounded-xl border border-rose-100 text-xs space-y-1"
                  >
                    <p className="font-bold text-rose-950">
                      ✗ {d.crop.commonName} ({d.crop.family?.name || "Keluarga Sama"})
                    </p>
                    <p className="text-stone-600 leading-relaxed">{d.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSPARANSI ATURAN & KETERBATASAN DATA */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 text-xs text-stone-600">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              Transparansi Aturan & Keterbatasan Data Agronomi:
            </h4>

            <ul className="list-disc pl-5 space-y-1">
              {evaluation.ruleReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 text-[11px] text-stone-500">
              <strong className="text-stone-700 block">Keterbatasan & Catatan Penggunaan:</strong>
              {evaluation.caveatsAndLimitations.map((c, i) => (
                <p key={i}>• {c}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM SIMPAN RENCANA ROTASI */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div>
          <h2 className="font-bold text-stone-900 text-base">
            2. Simpan Rencana Rotasi untuk Petak Terpilih
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Anda dapat menerima rekomendasi di atas atau memilih tanaman secara manual dari katalog.
          </p>
        </div>

        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Tanaman yang Direncanakan *
              </label>
              <select
                required
                value={selectedCropIdForPlan}
                onChange={(e) => {
                  setSelectedCropIdForPlan(e.target.value);
                  const cropObj = allCatalogCrops.find((c) => c.id === e.target.value);
                  setSelectedReasonForPlan(`Dipilih secara manual oleh pengguna: ${cropObj?.commonName}`);
                }}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">-- Pilih Tanaman dari Katalog --</option>
                {allCatalogCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.commonName} ({c.family?.name || "Pangan"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Alasan / Catatan Rotasi
              </label>
              <input
                type="text"
                value={selectedReasonForPlan}
                onChange={(e) => setSelectedReasonForPlan(e.target.value)}
                placeholder="Misal: Rotasi legum untuk memulihkan nitrogen..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Catatan Persiapan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Semai bibit di nampan 14 hari sebelum kacang dicabut..."
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingPlan || !selectedCropIdForPlan}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingPlan ? "Menyimpan Rencana..." : "Simpan Rencana Rotasi"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. DAFTAR RENCANA ROTASI TERSIMPAN */}
      <div className="space-y-4">
        <div>
          <h2 className="font-bold text-stone-900 text-base">
            3. Rencana Rotasi yang Tersimpan
          </h2>
          <p className="text-xs text-stone-500">
            Daftar rencana yang dapat disetujui, diterapkan, atau dibatalkan seiring musim berjalan
          </p>
        </div>

        {savedPlans.length === 0 ? (
          <EmptyState
            title="Belum ada rencana rotasi yang disimpan"
            description="Pilih petak di atas dan hitung rekomendasi rotasi untuk menyimpan rencana musim mendatang."
          />
        ) : (
          <div className="space-y-3">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-stone-900">
                      {plan.plotName}:
                    </span>
                    <span className="font-extrabold text-emerald-800 text-base">
                      {plan.cropName}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        plan.status === "disetujui"
                          ? "bg-emerald-100 text-emerald-800"
                          : plan.status === "diterapkan"
                          ? "bg-blue-100 text-blue-800"
                          : plan.status === "dibatalkan"
                          ? "bg-stone-100 text-stone-500"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    Musim: <strong className="text-stone-700">{plan.seasonName}</strong> ({plan.targetPeriod})
                  </p>

                  <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    {plan.recommendationReason}
                  </p>

                  {plan.notes && (
                    <p className="text-xs text-stone-500 italic">
                      Catatan: {plan.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={plan.status}
                    onChange={(e) => handleUpdatePlanStatus(plan.id, e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="draf">Draf</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="diterapkan">Diterapkan</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>

                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus Rencana"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

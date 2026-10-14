"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Sprout,
  Sun,
  Droplets,
  Calendar,
  Layers,
  Heart,
  Ban,
  X,
  Info,
} from "lucide-react";
import { NutrientCategoryBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";

interface CropItem {
  id: string;
  commonName: string;
  scientificName?: string | null;
  familyId?: string | null;
  nutrientCategory: string;
  isCoverCrop: boolean;
  daysToMaturity?: number | null;
  spacing?: string | null;
  waterNeeds?: string | null;
  sunlightNeeds?: string | null;
  companionPlants?: string | null;
  antagonistPlants?: string | null;
  guidelines?: string | null;
  isCustom: boolean;
  isDemo: boolean;
  family?: {
    id: string;
    name: string;
    commonName: string;
    rotationGroup: string;
  } | null;
}

interface PlantFamily {
  id: string;
  name: string;
  commonName: string;
}

export default function CropsCatalogPage() {
  const { showToast } = useToast();

  const [crops, setCrops] = useState<CropItem[]>([]);
  const [families, setFamilies] = useState<PlantFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("all");
  const [selectedNutrient, setSelectedNutrient] = useState("all");
  const [onlyCoverCrop, setOnlyCoverCrop] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cropForm, setCropForm] = useState({
    commonName: "",
    scientificName: "",
    familyId: "",
    nutrientCategory: "pemakan_sedang",
    isCoverCrop: false,
    daysToMaturity: "45",
    spacing: "25 x 30 cm",
    waterNeeds: "sedang",
    sunlightNeeds: "penuh",
    companionPlants: "",
    antagonistPlants: "",
    guidelines: "",
  });

  const fetchCropsAndFamilies = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cropsRes, familiesRes] = await Promise.all([
        fetch("/api/crops"),
        fetch("/api/plant-families"),
      ]);
      const [cropsJson, familiesJson] = await Promise.all([
        cropsRes.json(),
        familiesRes.json(),
      ]);

      if (cropsJson.success) setCrops(cropsJson.data || []);
      if (familiesJson.success) setFamilies(familiesJson.data || []);
    } catch {
      showToast("Gagal memuat katalog tanaman", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCropsAndFamilies();
  }, [fetchCropsAndFamilies]);

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.commonName.trim()) {
      showToast("Nama umum tanaman wajib diisi", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ...cropForm,
        familyId: cropForm.familyId || null,
        daysToMaturity: cropForm.daysToMaturity ? Number(cropForm.daysToMaturity) : null,
      };

      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Tanaman berhasil ditambahkan ke katalog", "success");
        setIsAddModalOpen(false);
        setCropForm({
          commonName: "",
          scientificName: "",
          familyId: "",
          nutrientCategory: "pemakan_sedang",
          isCoverCrop: false,
          daysToMaturity: "45",
          spacing: "25 x 30 cm",
          waterNeeds: "sedang",
          sunlightNeeds: "penuh",
          companionPlants: "",
          antagonistPlants: "",
          guidelines: "",
        });
        await fetchCropsAndFamilies();
      } else {
        showToast(json.error || "Gagal menambah tanaman", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side filtering
  const filteredCrops = crops.filter((crop) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      crop.commonName.toLowerCase().includes(q) ||
      (crop.scientificName && crop.scientificName.toLowerCase().includes(q)) ||
      (crop.family?.name && crop.family.name.toLowerCase().includes(q)) ||
      (crop.family?.commonName && crop.family.commonName.toLowerCase().includes(q));

    const matchesFamily =
      selectedFamily === "all" ? true : crop.familyId === selectedFamily;

    const matchesNutrient =
      selectedNutrient === "all" ? true : crop.nutrientCategory === selectedNutrient;

    const matchesCover = onlyCoverCrop ? crop.isCoverCrop : true;

    return matchesSearch && matchesFamily && matchesNutrient && matchesCover;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Katalog Tanaman & Botani
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {crops.length} Varietas
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Referensi kebutuhan hara, keluarga botani, tanaman pendamping, dan panduan budidaya.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tanaman Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama umum, nama ilmiah, atau keluarga botani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Keluarga Botani</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.commonName})
                </option>
              ))}
            </select>

            <select
              value={selectedNutrient}
              onChange={(e) => setSelectedNutrient(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Kebutuhan Hara</option>
              <option value="pemakan_berat">Pemakan Berat (Heavy Feeder)</option>
              <option value="pemakan_sedang">Pemakan Sedang (Sayur Daun)</option>
              <option value="pemakan_ringan">Pemakan Ringan (Tanaman Akar)</option>
              <option value="penyubur_nitrogen">Penyubur Nitrogen (Legum)</option>
            </select>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium text-stone-700 bg-stone-50/50 cursor-pointer select-none hover:bg-stone-100">
              <input
                type="checkbox"
                checked={onlyCoverCrop}
                onChange={(e) => setOnlyCoverCrop(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Tanaman Penutup Tanah</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid of Crops */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Memuat katalog tanaman...</div>
      ) : filteredCrops.length === 0 ? (
        <EmptyState
          title="Tidak ada tanaman yang cocok"
          description="Coba ubah kata kunci pencarian atau sesuaikan pilihan filter botani."
          action={{
            label: "Bersihkan Filter",
            onClick: () => {
              setSearchQuery("");
              setSelectedFamily("all");
              setSelectedNutrient("all");
              setOnlyCoverCrop(false);
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                        {crop.commonName}
                      </h3>
                      {crop.isDemo && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                          Data contoh
                        </span>
                      )}
                      {crop.isCustom && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Koleksi Anda
                        </span>
                      )}
                    </div>
                    {crop.scientificName && (
                      <p className="text-xs italic text-stone-500 mt-0.5">
                        {crop.scientificName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <NutrientCategoryBadge category={crop.nutrientCategory} />
                  {crop.isCoverCrop && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-medium border border-teal-300">
                      Penutup Tanah / Pupuk Hijau
                    </span>
                  )}
                </div>

                {/* Family Info */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium text-stone-500">Keluarga Botani:</span>
                    <strong className="text-stone-800">
                      {crop.family ? crop.family.name : "Belum terklasifikasi"}
                    </strong>
                  </div>
                  {crop.family?.commonName && (
                    <p className="text-[11px] text-stone-500 italic">
                      Kelompok: {crop.family.commonName} ({crop.family.rotationGroup})
                    </p>
                  )}
                </div>

                {/* Cultivation specs */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-50">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{crop.daysToMaturity ? `${crop.daysToMaturity} hari panen` : "Masa panen bervariasi"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-50">
                    <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{crop.spacing || "Jarak bebas"}</span>
                  </div>
                </div>

                {/* Companions and Antagonists */}
                {(crop.companionPlants || crop.antagonistPlants) && (
                  <div className="space-y-1.5 text-xs pt-1 border-t border-stone-100">
                    {crop.companionPlants && (
                      <div className="flex items-start gap-1.5 text-emerald-800">
                        <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                        <p className="leading-snug">
                          <strong>Pendamping baik:</strong> {crop.companionPlants}
                        </p>
                      </div>
                    )}
                    {crop.antagonistPlants && (
                      <div className="flex items-start gap-1.5 text-amber-900">
                        <Ban className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <p className="leading-snug">
                          <strong>Hindari berdekatan/berurutan:</strong> {crop.antagonistPlants}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Guidelines */}
                {crop.guidelines && (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-stone-700 leading-relaxed">
                    <p className="font-semibold text-amber-900 mb-0.5">Panduan Budidaya:</p>
                    <p>{crop.guidelines}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Tanaman Baru */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Tambah Tanaman ke Katalog</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Umum Tanaman (Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selada Keriting Hijau"
                  value={cropForm.commonName}
                  onChange={(e) => setCropForm({ ...cropForm, commonName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Ilmiah / Botani (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lactuca sativa"
                  value={cropForm.scientificName}
                  onChange={(e) => setCropForm({ ...cropForm, scientificName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Keluarga Botani
                  </label>
                  <select
                    value={cropForm.familyId}
                    onChange={(e) => setCropForm({ ...cropForm, familyId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">Lainnya / Tidak terdaftar</option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.commonName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Kategori Kebutuhan Hara *
                  </label>
                  <select
                    value={cropForm.nutrientCategory}
                    onChange={(e) => setCropForm({ ...cropForm, nutrientCategory: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="pemakan_sedang">Pemakan Sedang (Sayur Daun)</option>
                    <option value="pemakan_berat">Pemakan Berat (Buah/Sereal)</option>
                    <option value="pemakan_ringan">Pemakan Ringan (Akar/Umbi)</option>
                    <option value="penyubur_nitrogen">Penyubur Nitrogen (Legum)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Hari Hingga Panen (Rata-rata)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 35"
                    value={cropForm.daysToMaturity}
                    onChange={(e) => setCropForm({ ...cropForm, daysToMaturity: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Jarak Tanam Rekomendasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20 x 25 cm"
                    value={cropForm.spacing}
                    onChange={(e) => setCropForm({ ...cropForm, spacing: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cropForm.isCoverCrop}
                  onChange={(e) => setCropForm({ ...cropForm, isCoverCrop: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-stone-800">
                  Dapat digunakan sebagai tanaman penutup tanah / pupuk hijau
                </span>
              </label>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tanaman Pendamping Baik (Companion)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bawang, Seledri, Wortel"
                  value={cropForm.companionPlants}
                  onChange={(e) => setCropForm({ ...cropForm, companionPlants: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tanaman yang Sebaiknya Dihindari (Antagonist)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Buncis, Kacang panjang"
                  value={cropForm.antagonistPlants}
                  onChange={(e) => setCropForm({ ...cropForm, antagonistPlants: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Panduan Budidaya / Catatan Agronomi
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Memerlukan penyiraman rutin dua kali sehari, naungan paranet 50% di musim kemarau..."
                  value={cropForm.guidelines}
                  onChange={(e) => setCropForm({ ...cropForm, guidelines: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Tanaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

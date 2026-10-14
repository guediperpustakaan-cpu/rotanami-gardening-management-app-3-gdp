import { z } from "zod";

export const farmSchema = z.object({
  name: z.string().min(2, "Nama kebun minimal 2 karakter"),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Jakarta"),
});

export const plotSchema = z.object({
  name: z.string().min(2, "Nama petak minimal 2 karakter"),
  size: z.coerce.number().positive("Ukuran luas harus lebih besar dari 0"),
  unit: z.string().min(1, "Satuan luas wajib dipilih").default("m²"),
  soilType: z.string().optional().nullable(),
  sunlight: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["aktif", "istirahat", "arsip"]).default("aktif"),
});

export const cropSchema = z.object({
  commonName: z.string().min(2, "Nama umum tanaman minimal 2 karakter"),
  scientificName: z.string().optional().nullable(),
  familyId: z.string().optional().nullable(),
  nutrientCategory: z.enum([
    "pemakan_berat",
    "pemakan_sedang",
    "pemakan_ringan",
    "penyubur_nitrogen",
  ]).default("pemakan_sedang"),
  isCoverCrop: z.boolean().default(false),
  daysToMaturity: z.coerce.number().int().positive().optional().nullable(),
  spacing: z.string().optional().nullable(),
  waterNeeds: z.string().optional().nullable(),
  sunlightNeeds: z.string().optional().nullable(),
  companionPlants: z.string().optional().nullable(),
  antagonistPlants: z.string().optional().nullable(),
  guidelines: z.string().optional().nullable(),
});

export const plantingSchema = z.object({
  plotId: z.string().min(1, "Petak wajib dipilih"),
  cropId: z.string().min(1, "Tanaman wajib dipilih"),
  seasonId: z.string().optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tanam harus YYYY-MM-DD"),
  harvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal panen harus YYYY-MM-DD").optional().nullable().or(z.literal("")),
  status: z.enum(["direncanakan", "ditanam", "dipanen", "dibatalkan"]).default("ditanam"),
  harvestYield: z.coerce.number().positive("Hasil panen harus angka positif").optional().nullable(),
  yieldUnit: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const soilTestSchema = z.object({
  plotId: z.string().min(1, "Petak wajib dipilih"),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tes harus YYYY-MM-DD"),
  ph: z.coerce.number().min(0, "pH minimal 0").max(14, "pH maksimal 14").optional().nullable(),
  nitrogenPpm: z.coerce.number().optional().nullable(),
  nitrogenCategory: z.enum(["rendah", "sedang", "tinggi", "sangat_tinggi"]).optional().nullable().or(z.literal("")),
  phosphorusPpm: z.coerce.number().optional().nullable(),
  phosphorusCategory: z.enum(["rendah", "sedang", "tinggi", "sangat_tinggi"]).optional().nullable().or(z.literal("")),
  potassiumPpm: z.coerce.number().optional().nullable(),
  potassiumCategory: z.enum(["rendah", "sedang", "tinggi", "sangat_tinggi"]).optional().nullable().or(z.literal("")),
  organicMatterPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  testMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const observationSchema = z.object({
  plotId: z.string().min(1, "Petak wajib dipilih"),
  plantingId: z.string().optional().nullable(),
  category: z.enum(["hama", "penyakit", "pertumbuhan", "cuaca", "kesuburan", "catatan_lain"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal observasi harus YYYY-MM-DD"),
  severity: z.enum(["ringan", "sedang", "berat", "positif"]).optional().nullable(),
  description: z.string().min(3, "Deskripsi observasi minimal 3 karakter"),
  actionTaken: z.string().optional().nullable(),
});

export const rotationPlanSchema = z.object({
  plotId: z.string().min(1, "Petak wajib dipilih"),
  seasonName: z.string().min(2, "Nama musim minimal 2 karakter"),
  targetPeriod: z.string().min(2, "Rentang waktu rencana minimal 2 karakter"),
  plannedCropId: z.string().min(1, "Tanaman rencana wajib dipilih"),
  status: z.enum(["draf", "disetujui", "diterapkan", "dibatalkan"]).default("draf"),
  recommendationReason: z.string().default("Dipilih secara manual oleh pengguna"),
  notes: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  farmId: z.string().min(1, "Kebun wajib diisi"),
  plotId: z.string().optional().nullable(),
  plantingId: z.string().optional().nullable(),
  title: z.string().min(2, "Judul tugas minimal 2 karakter"),
  category: z.enum(["tanam", "panen", "pupuk", "uji_tanah", "pemeliharaan", "rotasi"]).default("pemeliharaan"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tugas harus YYYY-MM-DD"),
  completed: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

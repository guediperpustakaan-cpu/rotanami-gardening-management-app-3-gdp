import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// 1. Pengguna
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("pekebun").notNull(), // pekebun, pengelola_komunitas, agronom
  avatar: text("avatar"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Kebun
export const farms = pgTable(
  "farms",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    location: text("location"),
    description: text("description"),
    timezone: text("timezone").default("Asia/Jakarta").notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("farms_user_id_idx").on(table.userId)]
);

// 3. Anggota Kebun (opsional/dukungan kebun bersama)
export const farmMembers = pgTable(
  "farm_members",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("pengelola").notNull(), // pemilik, pengelola, anggota
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("farm_members_farm_id_idx").on(table.farmId),
    index("farm_members_user_id_idx").on(table.userId),
  ]
);

// 4. Petak / Bedeng
export const plots = pgTable(
  "plots",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    size: numeric("size").notNull(), // luas petak
    unit: text("unit").default("m²").notNull(), // m², hektar, tumbak, ru, bedeng
    soilType: text("soil_type"), // Lempung, Liat berpasir, Gembur berhumus, Gambut, Aluvial, Tanah merah (latosol)
    sunlight: text("sunlight"), // Penuh (>6 jam), Sebagian (3-6 jam), Teduh (<3 jam)
    notes: text("notes"),
    status: text("status").default("aktif").notNull(), // aktif, istirahat, arsip
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("plots_farm_id_idx").on(table.farmId)]
);

// 5. Keluarga Botani & Kelompok Rotasi
export const plantFamilies = pgTable("plant_families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // Nama botani: Solanaceae, Fabaceae, Brassicaceae, dll.
  commonName: text("common_name").notNull(), // Terung-terungan, Kacang-kacangan, dll.
  rotationGroup: text("rotation_group").notNull(), // Buah/Solanaceae, Legum, Daun/Brassica, Umbi/Akar, Cucurbita, Sereal
  nutrientDemands: text("nutrient_demands").notNull(), // tinggi, sedang, rendah, penambat_nitrogen
  commonPests: text("common_pests"), // Hama & penyakit khas yang perlu diwaspadai
  description: text("description"),
});

// 6. Katalog Tanaman
export const crops = pgTable(
  "crops",
  {
    id: text("id").primaryKey(),
    commonName: text("common_name").notNull(),
    scientificName: text("scientific_name"),
    familyId: text("family_id").references(() => plantFamilies.id),
    nutrientCategory: text("nutrient_category").default("pemakan_sedang").notNull(), // pemakan_berat, pemakan_sedang, pemakan_ringan, penyubur_nitrogen
    isCoverCrop: boolean("is_cover_crop").default(false).notNull(), // Tanaman penutup tanah / pupuk hijau
    daysToMaturity: integer("days_to_maturity"), // Rata-rata hari hingga panen
    spacing: text("spacing"), // Rekomendasi jarak tanam
    waterNeeds: text("water_needs"), // rendah, sedang, tinggi
    sunlightNeeds: text("sunlight_needs"), // penuh, parsial, naungan
    companionPlants: text("companion_plants"), // Tanaman pendamping baik
    antagonistPlants: text("antagonist_plants"), // Tanaman yang sebaiknya dihindari berurutan/berdampingan
    guidelines: text("guidelines"), // Catatan panduan budidaya umum
    isCustom: boolean("is_custom").default(false).notNull(), // Ditambahkan oleh pengguna
    isDemo: boolean("is_demo").default(false).notNull(), // Data contoh
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("crops_family_id_idx").on(table.familyId)]
);

// 7. Musim Tanam
export const seasons = pgTable(
  "seasons",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // Contoh: Musim Hujan 2025/2026, Musim Kemarau 2026
    startDate: text("start_date"),
    endDate: text("end_date"),
    status: text("status").default("aktif").notNull(), // aktif, mendatang, selesai
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("seasons_farm_id_idx").on(table.farmId)]
);

// 8. Riwayat Penanaman (Plantings)
export const plantings = pgTable(
  "plantings",
  {
    id: text("id").primaryKey(),
    plotId: text("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    cropId: text("crop_id")
      .notNull()
      .references(() => crops.id),
    seasonId: text("season_id").references(() => seasons.id, { onDelete: "set null" }),
    startDate: text("start_date").notNull(), // YYYY-MM-DD
    harvestDate: text("harvest_date"), // YYYY-MM-DD
    status: text("status").default("ditanam").notNull(), // direncanakan, ditanam, dipanen, dibatalkan
    harvestYield: numeric("harvest_yield"),
    yieldUnit: text("yield_unit"), // kg, ikat, buah, kuintal, ton
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("plantings_plot_id_idx").on(table.plotId),
    index("plantings_crop_id_idx").on(table.cropId),
  ]
);

// 9. Hasil Uji Kesehatan Tanah
export const soilTests = pgTable(
  "soil_tests",
  {
    id: text("id").primaryKey(),
    plotId: text("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    testDate: text("test_date").notNull(), // YYYY-MM-DD
    ph: numeric("ph"), // 3.0 - 9.0
    nitrogenPpm: numeric("nitrogen_ppm"),
    nitrogenCategory: text("nitrogen_category"), // rendah, sedang, tinggi, sangat_tinggi
    phosphorusPpm: numeric("phosphorus_ppm"),
    phosphorusCategory: text("phosphorus_category"), // rendah, sedang, tinggi, sangat_tinggi
    potassiumPpm: numeric("potassium_ppm"),
    potassiumCategory: text("potassium_category"), // rendah, sedang, tinggi, sangat_tinggi
    organicMatterPercent: numeric("organic_matter_percent"), // contoh: 3.2%
    testMethod: text("test_method"), // Kit Uji Cepat Mandiri, Laboratorium Tanah Dinas, pH Meter Tanah Digital, Pengamatan Visual
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("soil_tests_plot_id_idx").on(table.plotId)]
);

// 10. Catatan Observasi Lapangan
export const observations = pgTable(
  "observations",
  {
    id: text("id").primaryKey(),
    plotId: text("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    plantingId: text("planting_id").references(() => plantings.id, { onDelete: "set null" }),
    category: text("category").notNull(), // hama, penyakit, pertumbuhan, cuaca, kesuburan, catatan_lain
    date: text("date").notNull(), // YYYY-MM-DD
    severity: text("severity"), // ringan, sedang, berat, positif
    description: text("description").notNull(),
    actionTaken: text("action_taken"), // Tindakan yang diambil / solusi
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("observations_plot_id_idx").on(table.plotId),
    index("observations_planting_id_idx").on(table.plantingId),
  ]
);

// 11. Perencana Rotasi Tanaman (Rotation Plans)
export const rotationPlans = pgTable(
  "rotation_plans",
  {
    id: text("id").primaryKey(),
    plotId: text("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    seasonName: text("season_name").notNull(),
    targetPeriod: text("target_period").notNull(), // e.g. "Musim Hujan 2026 (Nov - Feb)"
    plannedCropId: text("planned_crop_id")
      .notNull()
      .references(() => crops.id),
    status: text("status").default("draf").notNull(), // draf, disetujui, diterapkan, dibatalkan
    recommendationReason: text("recommendation_reason").notNull(), // JSON string struktur alasan rotasi
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rotation_plans_plot_id_idx").on(table.plotId),
    index("rotation_plans_planned_crop_id_idx").on(table.plannedCropId),
  ]
);

// 12. Tugas & Pengingat Aktivitas
export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    farmId: text("farm_id")
      .notNull()
      .references(() => farms.id, { onDelete: "cascade" }),
    plotId: text("plot_id").references(() => plots.id, { onDelete: "cascade" }),
    plantingId: text("planting_id").references(() => plantings.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    category: text("category").notNull(), // tanam, panen, pupuk, uji_tanah, pemeliharaan, rotasi
    dueDate: text("due_date").notNull(), // YYYY-MM-DD
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tasks_farm_id_idx").on(table.farmId),
    index("tasks_plot_id_idx").on(table.plotId),
  ]
);

export interface PlantFamilyData {
  id: string;
  name: string;
  commonName: string;
  rotationGroup: string;
  nutrientDemands: string;
  commonPests?: string | null;
  description?: string | null;
}

export interface CropData {
  id: string;
  commonName: string;
  scientificName?: string | null;
  familyId?: string | null;
  family?: PlantFamilyData | null;
  nutrientCategory: string; // pemakan_berat, pemakan_sedang, pemakan_ringan, penyubur_nitrogen
  isCoverCrop: boolean;
  daysToMaturity?: number | null;
  spacing?: string | null;
  waterNeeds?: string | null;
  sunlightNeeds?: string | null;
  companionPlants?: string | null;
  antagonistPlants?: string | null;
  guidelines?: string | null;
  isCustom?: boolean;
}

export interface PlantingRecord {
  id: string;
  plotId: string;
  cropId: string;
  startDate: string;
  harvestDate?: string | null;
  status: string;
  crop?: CropData | null;
}

export interface ObservationRecord {
  id: string;
  plotId: string;
  category: string; // hama, penyakit, pertumbuhan, dll.
  severity?: string | null;
  description: string;
  date: string;
}

export interface RotationSuggestionItem {
  crop: CropData;
  score: number;
  badge: string; // "Saran Utama", "Penyubur Tanah", "Alternatif Daun", dll.
  reason: string;
  nutrientBenefit: string;
  pestBenefit: string;
}

export interface RotationEvaluationResult {
  hasSufficientData: boolean;
  statusMessage: string;
  primarySuggestion: RotationSuggestionItem | null;
  alternativeSuggestions: RotationSuggestionItem[];
  discouragedCrops: { crop: CropData; reason: string }[];
  historySummary: {
    lastCropName: string | null;
    lastFamilyName: string | null;
    lastNutrientCategory: string | null;
    consecutiveFamilyCount: number;
  };
  ruleReasons: string[];
  caveatsAndLimitations: string[];
}

export function evaluateCropRotation(params: {
  plotName: string;
  plantingsHistory: PlantingRecord[];
  observations: ObservationRecord[];
  catalogCrops: CropData[];
  targetSeasonName?: string;
}): RotationEvaluationResult {
  const { plotName, plantingsHistory, observations, catalogCrops, targetSeasonName } = params;

  const caveats: string[] = [
    "Saran ini adalah panduan umum berbasis keluarga botani dan siklus kebutuhan hara, bukan kepastian agronomis mutlak.",
    "Selalu pertimbangkan ketersediaan air, musim kemarau/hujan di wilayah Anda, serta kesiapan bibit.",
  ];

  if (!catalogCrops || catalogCrops.length === 0) {
    return {
      hasSufficientData: false,
      statusMessage: "Katalog tanaman kosong. Tambahkan tanaman ke dalam katalog terlebih dahulu.",
      primarySuggestion: null,
      alternativeSuggestions: [],
      discouragedCrops: [],
      historySummary: {
        lastCropName: null,
        lastFamilyName: null,
        lastNutrientCategory: null,
        consecutiveFamilyCount: 0,
      },
      ruleReasons: ["Katalog tanaman belum memiliki data untuk dianalisis."],
      caveatsAndLimitations: caveats,
    };
  }

  // Jika belum ada riwayat penanaman pada petak
  if (!plantingsHistory || plantingsHistory.length === 0) {
    // Sediakan saran pemula: tanaman yang mudah, menyuburkan, atau sayur daun cepat
    const starterLegumes = catalogCrops.filter((c) => c.nutrientCategory === "penyubur_nitrogen");
    const starterLeaves = catalogCrops.filter((c) => c.nutrientCategory === "pemakan_sedang" || c.nutrientCategory === "pemakan_ringan");

    const topStarter = starterLegumes[0] || starterLeaves[0] || catalogCrops[0];
    const starterAlternatives = catalogCrops
      .filter((c) => c.id !== topStarter.id)
      .slice(0, 3)
      .map((crop) => ({
        crop,
        score: 60,
        badge: crop.nutrientCategory === "penyubur_nitrogen" ? "Penyubur Tanah Awal" : "Pilihan Mudah",
        reason: "Pilihan fleksibel untuk memulai siklus bedeng baru.",
        nutrientBenefit: crop.nutrientCategory === "penyubur_nitrogen" ? "Membantu menambat hara nitrogen alami bagi tanah baru." : "Kebutuhan hara proporsional.",
        pestBenefit: "Belum ada riwayat hama/patogen tercatat di petak ini.",
      }));

    return {
      hasSufficientData: false,
      statusMessage: "Belum ada riwayat penanaman tercatat pada petak ini. Anda dapat memulai dengan tanaman penyubur tanah atau memilih tanaman secara manual.",
      primarySuggestion: {
        crop: topStarter,
        score: 75,
        badge: "Rekomendasi Awal Petak Baru",
        reason: `Petak "${plotName}" belum memiliki riwayat tanaman. Menanam tanaman seperti ${topStarter.commonName} di awal siklus sangat baik untuk membangun struktur biologi dan kesuburan tanah.`,
        nutrientBenefit: topStarter.nutrientCategory === "penyubur_nitrogen" ? "Menambat nitrogen alami ke tanah." : "Mudah bertumbuh pada petak awal.",
        pestBenefit: "Tanah masih bersih dari riwayat patogen tular-tanah spesifik.",
      },
      alternativeSuggestions: starterAlternatives,
      discouragedCrops: [],
      historySummary: {
        lastCropName: null,
        lastFamilyName: null,
        lastNutrientCategory: null,
        consecutiveFamilyCount: 0,
      },
      ruleReasons: [
        "Petak belum memiliki riwayat panen sebelumnya.",
        "Saran awal difokuskan pada tanaman yang ramah untuk petak perintis.",
      ],
      caveatsAndLimitations: [
        ...caveats,
        "Data riwayat belum cukup untuk memberi saran rotasi spesifik berbasis siklus tanaman sebelumnya.",
      ],
    };
  }

  // Mengurutkan riwayat tanam terbaru
  const sortedHistory = [...plantingsHistory].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const lastPlanting = sortedHistory[0];
  const lastCrop = lastPlanting.crop || catalogCrops.find((c) => c.id === lastPlanting.cropId);
  const lastFamilyId = lastCrop?.familyId || null;
  const lastFamilyName = lastCrop?.family?.name || (lastCrop?.familyId ? "Keluarga Terdaftar" : "Tidak diketahui");
  const lastNutrientCategory = lastCrop?.nutrientCategory || "pemakan_sedang";

  // Hitung berapa kali keluarga yang sama ditanam berturut-turut
  let consecutiveCount = 1;
  for (let i = 1; i < sortedHistory.length; i++) {
    const prevCrop = sortedHistory[i].crop || catalogCrops.find((c) => c.id === sortedHistory[i].cropId);
    if (prevCrop && prevCrop.familyId && prevCrop.familyId === lastFamilyId) {
      consecutiveCount++;
    } else {
      break;
    }
  }

  // Periksa catatan observasi untuk hama atau penyakit
  const pestObs = observations.filter(
    (obs) => obs.category === "hama" || obs.category === "penyakit"
  );
  const observedIssues = pestObs.map((obs) => obs.description.toLowerCase()).join(" ");

  const hasBacterialWiltOrSolanaceaeIssues =
    observedIssues.includes("layu") ||
    observedIssues.includes("bakteri") ||
    observedIssues.includes("fusarium") ||
    observedIssues.includes("kutu kebul") ||
    observedIssues.includes("antraknosa");

  const hasCaterpillarOrBrassicaceaeIssues =
    observedIssues.includes("ulat") ||
    observedIssues.includes("krop") ||
    observedIssues.includes("akar gada");

  const ruleReasons: string[] = [];
  ruleReasons.push(
    `Tanaman terakhir pada petak: ${lastCrop?.commonName || "Tanaman"} (${lastFamilyName}) dengan kategori hara ${
      lastNutrientCategory === "pemakan_berat"
        ? "Pemakan Berat (Heavy Feeder)"
        : lastNutrientCategory === "penyubur_nitrogen"
        ? "Penyubur Nitrogen (Legum)"
        : lastNutrientCategory === "pemakan_sedang"
        ? "Pemakan Sedang"
        : "Pemakan Ringan"
    }.`
  );

  if (consecutiveCount > 1) {
    ruleReasons.push(
      `Peringatan: Keluarga botani yang sama telah ditanam ${consecutiveCount} kali berturut-turut. Rotasi mutlak disarankan untuk mencegah ledakan hama patogen tular-tanah.`
    );
  }

  // Evaluasi setiap kandidat tanaman dari katalog
  const scoredCrops: {
    crop: CropData;
    score: number;
    badge: string;
    reason: string;
    nutrientBenefit: string;
    pestBenefit: string;
  }[] = [];

  const discouragedCrops: { crop: CropData; reason: string }[] = [];

  for (const candidate of catalogCrops) {
    let score = 50; // base score
    const reasonsList: string[] = [];
    let nutrientBenefit = "";
    let pestBenefit = "";
    let isDiscouraged = false;
    let discourageReason = "";

    // 1. Evaluasi Keluarga Botani (Aturan Pemutus Siklus Hama & Patogen)
    const isSameFamily =
      candidate.familyId && lastFamilyId && candidate.familyId === lastFamilyId;

    if (isSameFamily) {
      score -= 45;
      isDiscouraged = true;
      discourageReason = `Berasal dari keluarga yang sama (${lastFamilyName}). Menanamnya kembali berisiko melipatgandakan patogen tanah dan hama spesifik.`;
    } else {
      score += 20;
      pestBenefit = `Keluarga botani berbeda (${candidate.family?.name || "Keluarga Lain"}), memutus siklus inang hama/patogen ${lastCrop?.commonName || "tanaman lalu"}.`;
    }

    // Periksa riwayat masalah hama/penyakit petak
    if (candidate.familyId === "fam-solanaceae" && hasBacterialWiltOrSolanaceaeIssues) {
      score -= 30;
      isDiscouraged = true;
      discourageReason = `Terdapat riwayat observasi masalah layu/bakteri/hama Solanaceae di petak ini. Sebaiknya hindari keluarga Solanaceae selama 2-3 siklus berikutnya.`;
    }

    if (candidate.familyId === "fam-brassicaceae" && hasCaterpillarOrBrassicaceaeIssues) {
      score -= 15;
    }

    // 2. Evaluasi Siklus Kebutuhan Hara (Nutrient Rotation Logic)
    if (lastNutrientCategory === "pemakan_berat") {
      // Setelah pemakan berat (seperti Tomat, Jagung, Mentimun, Terung):
      // Rekomendasi terbaik: Penyubur nitrogen (Legum) atau Tanaman Penutup Tanah
      if (candidate.nutrientCategory === "penyubur_nitrogen") {
        score += 35;
        nutrientBenefit = "Mengikat nitrogen dari udara untuk memulihkan cadangan hara tanah yang terkuras oleh tanaman pemakan berat sebelumnya.";
        reasonsList.push("Pilihan ideal untuk restorasi kesuburan tanah.");
      } else if (candidate.isCoverCrop) {
        score += 30;
        nutrientBenefit = "Mencegah erosi dan menghasilkan mulsa biomassa kaya bahan organik.";
      } else if (candidate.nutrientCategory === "pemakan_ringan") {
        score += 15;
        nutrientBenefit = "Kebutuhan hara rendah sehingga memberi kesempatan tanah bernapas.";
      } else if (candidate.nutrientCategory === "pemakan_berat") {
        score -= 25;
        if (!isDiscouraged) {
          isDiscouraged = true;
          discourageReason = "Tanaman pemakan hara berat berurutan akan menguras hara tanah secara drastis.";
        }
      }
    } else if (lastNutrientCategory === "penyubur_nitrogen") {
      // Setelah Legum / Penyubur N (seperti Kacang Panjang, Buncis):
      // Tanah kaya residu nitrogen bintil akar. Paling ideal dimanfaatkan oleh tanaman sayuran daun (pemakan sedang)
      if (candidate.nutrientCategory === "pemakan_sedang") {
        score += 35;
        nutrientBenefit = "Sangat efisien memanfaatkan cadangan nitrogen bebas yang ditinggalkan oleh bintil akar tanaman legum sebelumnya.";
        reasonsList.push("Memaksimalkan pertumbuhan daun hijau segar.");
      } else if (candidate.nutrientCategory === "pemakan_berat") {
        score += 20;
        nutrientBenefit = "Dapat tumbuh baik karena tanah mendapat pasokan nitrogen baru dari siklus legum sebelumnya.";
      } else if (candidate.nutrientCategory === "penyubur_nitrogen") {
        score += 10;
        nutrientBenefit = "Keluarga legum kembali; baiknya diselingi sayuran daun agar keseimbangan hara mikro terjaga.";
      }
    } else if (lastNutrientCategory === "pemakan_sedang") {
      // Setelah pemakan sedang (misal Pakcoy, Sawi, Bawang):
      // Sangat bagus diikuti oleh tanaman akar / pemakan ringan (Wortel, Bayam) atau pemulih N
      if (candidate.nutrientCategory === "pemakan_ringan") {
        score += 30;
        nutrientBenefit = "Akar menembus kedalaman berbeda untuk menyerap mineral mikro tanpa menuntut nitrogen tinggi.";
        reasonsList.push("Melengkapi rotasi 3-4 tahap klasik.");
      } else if (candidate.nutrientCategory === "penyubur_nitrogen") {
        score += 25;
        nutrientBenefit = "Mempersiapkan cadangan hara sebelum masuk ke siklus pemakan berat.";
      }
    } else {
      // Setelah pemakan ringan (seperti Wortel, Bayam):
      // Tanah siap untuk kembali ke tanaman pemakan berat (dengan tambahan pupuk kandang/kompos) atau legum
      if (candidate.nutrientCategory === "pemakan_berat") {
        score += 25;
        nutrientBenefit = "Siklus siap untuk tanaman produktif utama setelah masa pemulihan petak.";
      } else if (candidate.nutrientCategory === "penyubur_nitrogen") {
        score += 25;
        nutrientBenefit = "Penguatan nitrogen sebelum penanaman buah/sereal skala penuh.";
      }
    }

    // 3. Tentukan Badge dan Keterangan
    let badge = "Alternatif Sehat";
    if (candidate.nutrientCategory === "penyubur_nitrogen") {
      badge = candidate.isCoverCrop ? "Penutup & Pemulih Tanah" : "Penyubur Nitrogen Alami";
    } else if (candidate.nutrientCategory === "pemakan_sedang") {
      badge = "Pemanfaat Nitrogen (Sayur Daun)";
    } else if (candidate.nutrientCategory === "pemakan_ringan") {
      badge = "Pemakan Ringan / Tanaman Akar";
    }

    const fullReason =
      reasonsList.length > 0
        ? reasonsList.join(" ")
        : `Rotasi aman dari keluarga ${lastFamilyName} ke ${candidate.family?.name || candidate.commonName}.`;

    if (isDiscouraged) {
      discouragedCrops.push({ crop: candidate, reason: discourageReason });
    }

    scoredCrops.push({
      crop: candidate,
      score,
      badge,
      reason: fullReason,
      nutrientBenefit: nutrientBenefit || "Keseimbangan serapan hara terjaga.",
      pestBenefit: pestBenefit || "Mengurangi risiko penumpukan hama spesifik.",
    });
  }

  // Urutkan skor tertinggi
  scoredCrops.sort((a, b) => b.score - a.score);

  const primarySuggestion = scoredCrops[0] || null;
  const alternativeSuggestions = scoredCrops.slice(1, 4);

  let statusMessage = "Rekomendasi rotasi berhasil dihitung berdasarkan riwayat petak dan katalog botani.";
  if (primarySuggestion) {
    statusMessage = `Saran utama untuk petak "${plotName}" adalah ${primarySuggestion.crop.commonName} (${primarySuggestion.badge}).`;
  }

  return {
    hasSufficientData: true,
    statusMessage,
    primarySuggestion,
    alternativeSuggestions,
    discouragedCrops: discouragedCrops.slice(0, 3),
    historySummary: {
      lastCropName: lastCrop?.commonName || null,
      lastFamilyName,
      lastNutrientCategory,
      consecutiveFamilyCount: consecutiveCount,
    },
    ruleReasons,
    caveatsAndLimitations: caveats,
  };
}

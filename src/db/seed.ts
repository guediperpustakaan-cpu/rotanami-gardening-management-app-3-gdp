import { db } from "./index";
import {
  users,
  farms,
  farmMembers,
  plots,
  plantFamilies,
  crops,
  seasons,
  plantings,
  soilTests,
  observations,
  rotationPlans,
  tasks,
} from "./schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Memulai pengisian data awal (seeding)...");

  // 1. Keluarga Botani
  const familiesData = [
    {
      id: "fam-solanaceae",
      name: "Solanaceae",
      commonName: "Terung-terungan (Cabai, Tomat, Terung, Kentang)",
      rotationGroup: "Solanaceae",
      nutrientDemands: "tinggi",
      commonPests: "Layu bakteri (Ralstonia solanacearum), kutu kebul (Bemisia tabaci), antraknosa, ulat grayak.",
      description: "Tanaman pemakan hara berat, rentan penyakit tular-tanah. Hindari menanam berulang di petak yang sama tanpa jeda minimal 2-3 musim.",
    },
    {
      id: "fam-fabaceae",
      name: "Fabaceae / Leguminosae",
      commonName: "Polong-polongan / Legum (Kacang Panjang, Buncis, Kedelai)",
      rotationGroup: "Legum",
      nutrientDemands: "penambat_nitrogen",
      commonPests: "Ulat polong (Maruca testulalis), kutu daun hitam, karat daun.",
      description: "Bekerja sama dengan bakteri Rhizobium mengikat nitrogen bebas dari udara ke bintil akar, menyuburkan kembali tanah setelah tanaman pemakan berat.",
    },
    {
      id: "fam-brassicaceae",
      name: "Brassicaceae / Cruciferae",
      commonName: "Kubis-kubisan / Sesawian (Pakcoy, Caisim, Kubis, Kailan)",
      rotationGroup: "Daun / Brassica",
      nutrientDemands: "sedang",
      commonPests: "Ulat krop (Plutella xylostella), ulat daun, akar gada (Plasmodiophora brassicae).",
      description: "Sayuran daun bertumbuh cepat, memerlukan nitrogen dan sulfur seimbang, cocok ditanam setelah legum atau pupuk hijau.",
    },
    {
      id: "fam-cucurbitaceae",
      name: "Cucurbitaceae",
      commonName: "Labu-labuan (Mentimun, Oyong, Pare, Labu Madu)",
      rotationGroup: "Cucurbita / Buah Merambat",
      nutrientDemands: "tinggi",
      commonPests: "Lalat buah (Bactrocera cucurbitae), embun tepung (powdery mildew), kumbang daun oteng-oteng.",
      description: "Merambat dan membutuhkan bahan organik melimpah serta drainase baik. Menghasilkan biomassa besar yang menaungi tanah.",
    },
    {
      id: "fam-alliaceae",
      name: "Alliaceae / Amaryllidaceae",
      commonName: "Bawang-bawangan (Bawang Merah, Daun Bawang, Bawang Putih)",
      rotationGroup: "Alliaceae / Umbi Aroma",
      nutrientDemands: "sedang",
      commonPests: "Ulat bawang (Spodoptera exigua), layu fusarium (moler), trips.",
      description: "Aroma belerang khas membantu menolak beberapa serangga hama perusak. Memerlukan tanah gembur tanpa genangan.",
    },
    {
      id: "fam-amaranthaceae",
      name: "Amaranthaceae",
      commonName: "Bayam-bayaman (Bayam Hijau, Bayam Merah, Kangkung Convolvulaceae)",
      rotationGroup: "Daun Cepat",
      nutrientDemands: "sedang",
      commonPests: "Ulat daun, belalang, karat putih daun.",
      description: "Siklus tanam singkat (20-35 hari), ideal sebagai selingan cepat antar musim panen utama.",
    },
    {
      id: "fam-apiaceae",
      name: "Apiaceae / Umbelliferae",
      commonName: "Wortel-wortelan (Wortel, Seledri, Adas)",
      rotationGroup: "Umbi / Akar & Daun Aromatik",
      nutrientDemands: "rendah",
      commonPests: "Nematoda bengkak akar, lalat wortel, bercak daun cercospora.",
      description: "Akar tunggang menembus lapisan tanah dalam dan membantu aerasi. Menyerap sisa hara mineral lapisan bawah.",
    },
    {
      id: "fam-poaceae",
      name: "Poaceae / Gramineae",
      commonName: "Rumput & Sereal (Jagung Manis, Sorghum, Padi Gogo)",
      rotationGroup: "Sereal / Pemutus Siklus",
      nutrientDemands: "tinggi",
      commonPests: "Ulat penggerek batang, bulai jagung (Peronosclerospora), ulat grayak frugiperda.",
      description: "Menghasilkan akar serabut luas dan residu bahan organik tinggi. Sangat baik sebagai pemutus siklus penyakit sayuran daun dan buah.",
    },
  ];

  for (const fam of familiesData) {
    await db
      .insert(plantFamilies)
      .values(fam)
      .onConflictDoUpdate({
        target: plantFamilies.id,
        set: {
          name: fam.name,
          commonName: fam.commonName,
          rotationGroup: fam.rotationGroup,
          nutrientDemands: fam.nutrientDemands,
          commonPests: fam.commonPests,
          description: fam.description,
        },
      });
  }

  // 2. Katalog Tanaman (Crops)
  const cropsData = [
    {
      id: "crop-tomat",
      commonName: "Tomat Rampai / Cherry",
      scientificName: "Solanum lycopersicum",
      familyId: "fam-solanaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 75,
      spacing: "50 x 60 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Kemangi, Marigold, Wortel, Bawang",
      antagonistPlants: "Kubis, Buncis rambat, Jagung",
      guidelines: "Butuh tiang ajir penopang, pemangkasan tunas air, dan mulsa untuk mencegah percikan tanah ke daun.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-cabai-rawit",
      commonName: "Cabai Rawit",
      scientificName: "Capsicum frutescens",
      familyId: "fam-solanaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 90,
      spacing: "60 x 60 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Kemangi, Daun Bawang, Tomat",
      antagonistPlants: "Adas, Buncis",
      guidelines: "Hindari genangan air untuk mencegah layu fusarium; tambahkan kalsium untuk mencegah busuk pantat buah.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-terung-ungu",
      commonName: "Terung Ungu Panjang",
      scientificName: "Solanum melongena",
      familyId: "fam-solanaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 70,
      spacing: "60 x 70 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Kacang Tanah, Marigold, Bayam",
      antagonistPlants: "Adas",
      guidelines: "Sensitif terhadap kekeringan saat pembentukan bunga dan buah.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-kacang-panjang",
      commonName: "Kacang Panjang",
      scientificName: "Vigna unguiculata subsp. sesquipedalis",
      familyId: "fam-fabaceae",
      nutrientCategory: "penyubur_nitrogen",
      isCoverCrop: false,
      daysToMaturity: 50,
      spacing: "30 x 60 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Jagung, Mentimun, Terung",
      antagonistPlants: "Bawang merah, Bawang putih",
      guidelines: "Menambat nitrogen udara ke tanah. Potong batang setelah masa panen berakhir dan biarkan akarnya membusuk di tanah.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-buncis",
      commonName: "Buncis Tegak",
      scientificName: "Phaseolus vulgaris",
      familyId: "fam-fabaceae",
      nutrientCategory: "penyubur_nitrogen",
      isCoverCrop: false,
      daysToMaturity: 55,
      spacing: "25 x 40 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Jagung, Wortel, Seledri, Mentimun",
      antagonistPlants: "Bawang-bawangan, Adas",
      guidelines: "Tidak memerlukan lanjaran tinggi, menyuburkan tanah untuk siklus sayuran daun berikutnya.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-kacang-hijau-cover",
      commonName: "Kacang Hijau (Penutup Tanah / Pupuk Hijau)",
      scientificName: "Vigna radiata",
      familyId: "fam-fabaceae",
      nutrientCategory: "penyubur_nitrogen",
      isCoverCrop: true,
      daysToMaturity: 45,
      spacing: "Tebar rapat / 15 x 20 cm",
      waterNeeds: "rendah",
      sunlightNeeds: "penuh",
      companionPlants: "Semua tanaman petak rotasi",
      antagonistPlants: "Tidak ada catatan",
      guidelines: "Tumbuh cepat menekan gulma, dipangkas dan dicacah menjadi mulsa organik sebelum membentuk polong matang.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-pakcoy",
      commonName: "Pakcoy Hijau",
      scientificName: "Brassica rapa subsp. chinensis",
      familyId: "fam-brassicaceae",
      nutrientCategory: "pemakan_sedang",
      isCoverCrop: false,
      daysToMaturity: 35,
      spacing: "20 x 20 cm",
      waterNeeds: "tinggi",
      sunlightNeeds: "penuh",
      companionPlants: "Seledri, Bawang merah, Kemangi",
      antagonistPlants: "Tomat, Cabai (jika tanah miskin hara)",
      guidelines: "Panen cepat, menyukai tanah gembur berkadar humus cukup dan penyiraman teratur pagi dan sore.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-caisim",
      commonName: "Caisim / Sawi Manis",
      scientificName: "Brassica juncea",
      familyId: "fam-brassicaceae",
      nutrientCategory: "pemakan_sedang",
      isCoverCrop: false,
      daysToMaturity: 30,
      spacing: "20 x 20 cm",
      waterNeeds: "tinggi",
      sunlightNeeds: "penuh",
      companionPlants: "Bawang daun, Mint, Selada",
      antagonistPlants: "Stroberi",
      guidelines: "Periksa daun bagian bawah secara rutin dari serangan ulat pemakan daun.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-mentimun",
      commonName: "Mentimun Lokal",
      scientificName: "Cucumis sativus",
      familyId: "fam-cucurbitaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 45,
      spacing: "40 x 60 cm",
      waterNeeds: "tinggi",
      sunlightNeeds: "penuh",
      companionPlants: "Jagung, Buncis, Marigold, Bunga matahari",
      antagonistPlants: "Rempah aromatik tajam, Kentang",
      guidelines: "Manfaatkan rambatan jaring; pasang perangkap kuning berperekat untuk lalat buah.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-oyong",
      commonName: "Oyong / Gambas",
      scientificName: "Luffa acutangula",
      familyId: "fam-cucurbitaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 50,
      spacing: "50 x 80 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Kacang panjang, Jagung",
      antagonistPlants: "Tidak ada catatan",
      guidelines: "Buat para-para atau teralis kokoh di atas bedeng petak.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-bawang-merah",
      commonName: "Bawang Merah",
      scientificName: "Allium cepa var. aggregatum",
      familyId: "fam-alliaceae",
      nutrientCategory: "pemakan_sedang",
      isCoverCrop: false,
      daysToMaturity: 65,
      spacing: "15 x 15 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Wortel, Tomat, Selada, Caisim",
      antagonistPlants: "Kacang-kacangan, Buncis",
      guidelines: "Tanah harus berpasir gembur dan tidak tergenang air; kurangi air 1-2 minggu jelang panen.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-daun-bawang",
      commonName: "Daun Bawang / Lonchang",
      scientificName: "Allium fistulosum",
      familyId: "fam-alliaceae",
      nutrientCategory: "pemakan_sedang",
      isCoverCrop: false,
      daysToMaturity: 60,
      spacing: "20 x 20 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Tomat, Seledri, Wortel",
      antagonistPlants: "Kacang polong, Buncis",
      guidelines: "Bisa dipanen secara berkelanjutan dengan memotong daun luar saja.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-bayam-petik",
      commonName: "Bayam Hijau Petik",
      scientificName: "Amaranthus tricolor",
      familyId: "fam-amaranthaceae",
      nutrientCategory: "pemakan_ringan",
      isCoverCrop: false,
      daysToMaturity: 25,
      spacing: "15 x 15 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Jagung, Buncis, Terung",
      antagonistPlants: "Tidak ada catatan khusus",
      guidelines: "Tumbuh cepat, dapat dipanen dengan petik pucuk berkali-kali untuk mendorong percabangan baru.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-kangkung",
      commonName: "Kangkung Darat",
      scientificName: "Ipomoea aquatica",
      familyId: null, // Convolvulaceae
      nutrientCategory: "pemakan_ringan",
      isCoverCrop: false,
      daysToMaturity: 28,
      spacing: "15 x 15 cm",
      waterNeeds: "tinggi",
      sunlightNeeds: "penuh",
      companionPlants: "Terung, Cabai",
      antagonistPlants: "Tidak ada catatan",
      guidelines: "Sangat toleran, perbanyakan dari benih biji atau stek batang. Menyerap air dan hara permukaan.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-wortel",
      commonName: "Wortel Manis",
      scientificName: "Daucus carota",
      familyId: "fam-apiaceae",
      nutrientCategory: "pemakan_ringan",
      isCoverCrop: false,
      daysToMaturity: 80,
      spacing: "10 x 20 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Bawang merah, Daun bawang, Selada, Rosemary",
      antagonistPlants: "Adas, Ketumbar",
      guidelines: "Kondisi tanah wajib gembur bebas bebatuan agar umbi lurus dan tidak bercabang.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-jagung-manis",
      commonName: "Jagung Manis",
      scientificName: "Zea mays var. saccharata",
      familyId: "fam-poaceae",
      nutrientCategory: "pemakan_berat",
      isCoverCrop: false,
      daysToMaturity: 70,
      spacing: "25 x 75 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Kacang panjang, Labu, Mentimun (Pola Tiga Bersaudara / Three Sisters)",
      antagonistPlants: "Tomat",
      guidelines: "Penyerbukan oleh angin, tanam dalam blok minimal 3 baris bukan 1 baris memanjang agar tongkol terisi penuh.",
      isCustom: false,
      isDemo: true,
    },
    {
      id: "crop-kemangi",
      commonName: "Kemangi Wangi",
      scientificName: "Ocimum basilicum",
      familyId: null, // Lamiaceae
      nutrientCategory: "pemakan_ringan",
      isCoverCrop: false,
      daysToMaturity: 35,
      spacing: "30 x 30 cm",
      waterNeeds: "sedang",
      sunlightNeeds: "penuh",
      companionPlants: "Tomat, Cabai, Terung",
      antagonistPlants: "Ruda",
      guidelines: "Aroma minyak atsirinya berfungsi sebagai pengusir hama alami (repellent) bagi lalat buah dan kutu.",
      isCustom: false,
      isDemo: true,
    },
  ];

  for (const c of cropsData) {
    await db
      .insert(crops)
      .values(c)
      .onConflictDoUpdate({
        target: crops.id,
        set: {
          commonName: c.commonName,
          scientificName: c.scientificName,
          familyId: c.familyId,
          nutrientCategory: c.nutrientCategory,
          isCoverCrop: c.isCoverCrop,
          daysToMaturity: c.daysToMaturity,
          spacing: c.spacing,
          waterNeeds: c.waterNeeds,
          sunlightNeeds: c.sunlightNeeds,
          companionPlants: c.companionPlants,
          antagonistPlants: c.antagonistPlants,
          guidelines: c.guidelines,
          isCustom: c.isCustom,
          isDemo: c.isDemo,
        },
      });
  }

  // 3. Pengguna Utama & Contoh
  const defaultUserId = "usr-budi-demo";
  await db
    .insert(users)
    .values({
      id: defaultUserId,
      name: "Budi Santoso",
      email: "budi.santoso@rotanami.id",
      role: "pekebun",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    })
    .onConflictDoNothing();

  // 4. Kebun Contoh
  const defaultFarmId = "farm-mandiri-cipagalo";
  await db
    .insert(farms)
    .values({
      id: defaultFarmId,
      userId: defaultUserId,
      name: "Kebun Mandiri Cipagalo (Data contoh)",
      location: "Cipagalo, Kec. Bojongsoang, Kab. Bandung",
      description: "Kebun pekarangan percontohan sayur pangan sehat keluarga dan edukasi rotasi tanaman organik.",
      timezone: "Asia/Jakarta",
      isDemo: true,
    })
    .onConflictDoNothing();

  // 5. Petak-petak Kebun
  const plotsData = [
    {
      id: "plot-bedeng-a",
      farmId: defaultFarmId,
      name: "Bedeng A (Sayur Buah / Solanaceae)",
      size: "15.0",
      unit: "m²",
      soilType: "Lempung berpasir",
      sunlight: "Penuh (>6 jam)",
      notes: "Kaya sinar matahari pagi hingga sore, dekat jalur pipa siram tetes.",
      status: "aktif",
    },
    {
      id: "plot-bedeng-b",
      farmId: defaultFarmId,
      name: "Bedeng B (Rotasi Legum & Daun)",
      size: "20.0",
      unit: "m²",
      soilType: "Gembur berhumus",
      sunlight: "Penuh (>6 jam)",
      notes: "Bedeng paling subur, baru ditambahkan kompos kohe kambing matang 2 bulan lalu.",
      status: "aktif",
    },
    {
      id: "plot-bedeng-c",
      farmId: defaultFarmId,
      name: "Bedeng C (Sayur Cepat Panen)",
      size: "12.5",
      unit: "m²",
      soilType: "Liat gembur",
      sunlight: "Sebagian (3-6 jam)",
      notes: "Sebelah barat terhalang pohon mangga, bagus untuk caisim dan kangkung.",
      status: "aktif",
    },
    {
      id: "plot-petak-d",
      farmId: defaultFarmId,
      name: "Petak D (Pekarangan Depan)",
      size: "8.0",
      unit: "m²",
      soilType: "Tanah merah lempung",
      sunlight: "Penuh (>6 jam)",
      notes: "Sedang dipersiapkan untuk penanaman jagung manis dan kacang tanah.",
      status: "istirahat",
    },
  ];

  for (const p of plotsData) {
    await db
      .insert(plots)
      .values(p)
      .onConflictDoNothing();
  }

  // 6. Musim Tanam
  const defaultSeasonId = "season-kemarau-2026";
  await db
    .insert(seasons)
    .values({
      id: defaultSeasonId,
      farmId: defaultFarmId,
      name: "Musim Kemarau 2026 (Data contoh)",
      startDate: "2026-04-01",
      endDate: "2026-09-30",
      status: "aktif",
    })
    .onConflictDoNothing();

  // 7. Riwayat Penanaman (Plantings)
  const plantingsData = [
    // Bedeng A: Musim lalu ditanami Tomat (Solanaceae), sekarang Kacang Panjang (Fabaceae) untuk memulihkan N!
    {
      id: "plt-1-bedeng-a-tomat",
      plotId: "plot-bedeng-a",
      cropId: "crop-tomat",
      seasonId: defaultSeasonId,
      startDate: "2025-11-10",
      harvestDate: "2026-01-28",
      status: "dipanen",
      harvestYield: "42.5",
      yieldUnit: "kg",
      notes: "Hasil sangat memuaskan, namun muncul sedikit bercak daun menjelang akhir musim panen.",
    },
    {
      id: "plt-2-bedeng-a-kacang",
      plotId: "plot-bedeng-a",
      cropId: "crop-kacang-panjang",
      seasonId: defaultSeasonId,
      startDate: "2026-02-15",
      harvestDate: null,
      status: "ditanam",
      harvestYield: null,
      yieldUnit: "kg",
      notes: "Ditanam sebagai pemulih nitrogen tanah setelah tanaman tomat pemakan berat.",
    },
    // Bedeng B: Musim lalu Jagung Manis, sekarang Pakcoy
    {
      id: "plt-3-bedeng-b-jagung",
      plotId: "plot-bedeng-b",
      cropId: "crop-jagung-manis",
      seasonId: defaultSeasonId,
      startDate: "2025-10-01",
      harvestDate: "2025-12-18",
      status: "dipanen",
      harvestYield: "65.0",
      yieldUnit: "buah",
      notes: "Batang jagung dicacah dimasukkan ke kotak komposter petak.",
    },
    {
      id: "plt-4-bedeng-b-pakcoy",
      plotId: "plot-bedeng-b",
      cropId: "crop-pakcoy",
      seasonId: defaultSeasonId,
      startDate: "2026-03-01",
      harvestDate: null,
      status: "ditanam",
      harvestYield: null,
      yieldUnit: "kg",
      notes: "Tumbuh serempak, daun segar berukuran sedang.",
    },
    // Bedeng C: Kangkung
    {
      id: "plt-5-bedeng-c-kangkung",
      plotId: "plot-bedeng-c",
      cropId: "crop-kangkung",
      seasonId: defaultSeasonId,
      startDate: "2026-03-10",
      harvestDate: null,
      status: "ditanam",
      harvestYield: null,
      yieldUnit: "ikat",
      notes: "Sistem cabut akar direncanakan akhir bulan.",
    },
  ];

  for (const pl of plantingsData) {
    await db
      .insert(plantings)
      .values(pl)
      .onConflictDoNothing();
  }

  // 8. Hasil Uji Kesehatan Tanah (Soil Tests)
  const soilTestsData = [
    {
      id: "soil-1-bedeng-a",
      plotId: "plot-bedeng-a",
      testDate: "2025-10-25",
      ph: "6.2",
      nitrogenPpm: "18.5",
      nitrogenCategory: "sedang",
      phosphorusPpm: "24.0",
      phosphorusCategory: "tinggi",
      potassiumPpm: "160.0",
      potassiumCategory: "sedang",
      organicMatterPercent: "3.2",
      testMethod: "Kit Uji Warna Mandiri NPK",
      notes: "Uji sebelum tanam tomat awal musim hujan. Butuh tambahan sedikit kapur dolomit dan kompos.",
    },
    {
      id: "soil-2-bedeng-a",
      plotId: "plot-bedeng-a",
      testDate: "2026-02-05",
      ph: "6.5",
      nitrogenPpm: "14.2",
      nitrogenCategory: "rendah",
      phosphorusPpm: "20.5",
      phosphorusCategory: "sedang",
      potassiumPpm: "135.0",
      potassiumCategory: "sedang",
      organicMatterPercent: "3.5",
      testMethod: "Kit Uji Warna Mandiri NPK",
      notes: "Nitrogen turun setelah panen tomat, sangat tepat dilanjutkan dengan tanaman legum penambat nitrogen.",
    },
    {
      id: "soil-3-bedeng-b",
      plotId: "plot-bedeng-b",
      testDate: "2026-01-10",
      ph: "6.8",
      nitrogenPpm: "28.0",
      nitrogenCategory: "tinggi",
      phosphorusPpm: "32.0",
      phosphorusCategory: "tinggi",
      potassiumPpm: "210.0",
      potassiumCategory: "tinggi",
      organicMatterPercent: "4.8",
      testMethod: "Laboratorium Uji Tanah Dinas Tanaman Pangan",
      notes: "Hasil analisis resmi lab. Kondisi hara makro sangat baik dan pH mendekati netral ideal.",
    },
  ];

  for (const st of soilTestsData) {
    await db
      .insert(soilTests)
      .values(st)
      .onConflictDoNothing();
  }

  // 9. Catatan Observasi Lapangan
  const observationsData = [
    {
      id: "obs-1-bedeng-a",
      plotId: "plot-bedeng-a",
      plantingId: "plt-2-bedeng-a-kacang",
      category: "hama",
      date: "2026-03-12",
      severity: "ringan",
      description: "Terlihat sedikit kutu daun hitam (Aphis craccivora) pada beberapa pucuk muda kacang panjang.",
      actionTaken: "Semprot pestisida nabati rebusan daun mimba dan bawang putih di sore hari.",
    },
    {
      id: "obs-2-bedeng-b",
      plotId: "plot-bedeng-b",
      plantingId: "plt-4-bedeng-b-pakcoy",
      category: "pertumbuhan",
      date: "2026-03-15",
      severity: "positif",
      description: "Pertumbuhan vegetatif pakcoy serempak, daun hijau segar tanpa lubang ulat.",
      actionTaken: "Pemberian pupuk organik cair (POC) lamtoro konsentrasi 1:20.",
    },
    {
      id: "obs-3-petak-d",
      plotId: "plot-petak-d",
      plantingId: null,
      category: "kesuburan",
      date: "2026-03-08",
      severity: "sedang",
      description: "Tanah terlihat sedikit memadat setelah beberapa hari panas terik tanpa tutupan kanopi.",
      actionTaken: "Penambahan mulsa jerami padi dan rencana penaburan kapur dolomit 100g/m².",
    },
  ];

  for (const ob of observationsData) {
    await db
      .insert(observations)
      .values(ob)
      .onConflictDoNothing();
  }

  // 10. Rencana Rotasi Tanaman
  const rotationPlansData = [
    {
      id: "rot-1-bedeng-a",
      plotId: "plot-bedeng-a",
      seasonName: "Musim Pancaroba Mei - Juli 2026",
      targetPeriod: "Mei - Juli 2026",
      plannedCropId: "crop-pakcoy",
      status: "disetujui",
      recommendationReason: JSON.stringify({
        primarySuggestion: "crop-pakcoy",
        reason: "Setelah kacang panjang (Legum) memulihkan nitrogen tanah, sayuran daun seperti Pakcoy (Brassicaceae) akan memanfaatkan cadangan N tersebut secara optimal tanpa menguras hara mikro berat.",
        previousFamily: "Fabaceae / Leguminosae",
        nextFamily: "Brassicaceae",
        riskNotes: "Bukan keluarga Solanaceae, sehingga memutus siklus inang layu bakteri tomat musim sebelumnya.",
        confidenceNote: "Rekomendasi bersifat panduan umum berbasis rotasi kelompok hara dan botani.",
      }),
      notes: "Siapkan persemaian benih pakcoy pada tray 10 hari sebelum kacang panjang dibongkar.",
    },
    {
      id: "rot-2-bedeng-b",
      plotId: "plot-bedeng-b",
      seasonName: "Musim Kemarau Lanjutan Juli 2026",
      targetPeriod: "Juli - September 2026",
      plannedCropId: "crop-wortel",
      status: "draf",
      recommendationReason: JSON.stringify({
        primarySuggestion: "crop-wortel",
        reason: "Setelah sayuran daun (Pakcoy) memakan hara atas, giliran tanaman akar (Wortel / Apiaceae) dengan kebutuhan hara rendah memanfaatkan lapisan tanah lebih dalam.",
        previousFamily: "Brassicaceae",
        nextFamily: "Apiaceae",
        riskNotes: "Memecah siklus ulat daun Brassicaceae.",
        confidenceNote: "Tanah perlu digemburkan ulang agar umbi wortel tidak bercabang.",
      }),
      notes: "Pastikan tanah dibajak cangkul halus dan bebas kerikil.",
    },
  ];

  for (const rp of rotationPlansData) {
    await db
      .insert(rotationPlans)
      .values(rp)
      .onConflictDoNothing();
  }

  // 11. Pengingat & Tugas
  const tasksData = [
    {
      id: "task-1-bedeng-b",
      farmId: defaultFarmId,
      plotId: "plot-bedeng-b",
      plantingId: "plt-4-bedeng-b-pakcoy",
      title: "Panen selektif pakcoy hijau",
      category: "panen",
      dueDate: "2026-04-05",
      completed: false,
      notes: "Pilih krop yang sudah padat dan memiliki bobot sekitar 150-200 gram.",
    },
    {
      id: "task-2-bedeng-a",
      farmId: defaultFarmId,
      plotId: "plot-bedeng-a",
      plantingId: "plt-2-bedeng-a-kacang",
      title: "Pengecekan lanjaran bambu kacang panjang",
      category: "pemeliharaan",
      dueDate: "2026-03-25",
      completed: true,
      notes: "Tali rambatan diperkuat untuk mengantisipasi angin kencang sore.",
    },
    {
      id: "task-3-petak-d",
      farmId: defaultFarmId,
      plotId: "plot-petak-d",
      plantingId: null,
      title: "Uji pH tanah pekarangan sebelum olah tanah",
      category: "uji_tanah",
      dueDate: "2026-04-01",
      completed: false,
      notes: "Ambil 4 titik sampel tanah komposit kedalaman 15 cm.",
    },
    {
      id: "task-4-bedeng-a",
      farmId: defaultFarmId,
      plotId: "plot-bedeng-a",
      plantingId: null,
      title: "Semai bibit pakcoy untuk rotasi berikutnya",
      category: "tanam",
      dueDate: "2026-04-10",
      completed: false,
      notes: "Gunakan media semai arang sekam dan cocopeat 1:1 steril.",
    },
  ];

  for (const t of tasksData) {
    await db
      .insert(tasks)
      .values(t)
      .onConflictDoNothing();
  }

  console.log("Seeding data selesai dengan sukses!");
}

// Boleh dijalankan langsung lewat CLI
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seed CLI selesai.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Gagal menjalankan seed:", err);
      process.exit(1);
    });
}

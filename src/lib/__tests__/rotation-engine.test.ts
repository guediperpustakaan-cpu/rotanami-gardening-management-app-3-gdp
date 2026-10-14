import { describe, it, expect } from "vitest";
import { evaluateCropRotation, CropData, PlantingRecord, ObservationRecord } from "../rotation-engine";

const sampleCatalog: CropData[] = [
  {
    id: "crop-tomat",
    commonName: "Tomat",
    familyId: "fam-solanaceae",
    family: {
      id: "fam-solanaceae",
      name: "Solanaceae",
      commonName: "Terung-terungan",
      rotationGroup: "Solanaceae",
      nutrientDemands: "tinggi",
    },
    nutrientCategory: "pemakan_berat",
    isCoverCrop: false,
  },
  {
    id: "crop-cabai",
    commonName: "Cabai Rawit",
    familyId: "fam-solanaceae",
    family: {
      id: "fam-solanaceae",
      name: "Solanaceae",
      commonName: "Terung-terungan",
      rotationGroup: "Solanaceae",
      nutrientDemands: "tinggi",
    },
    nutrientCategory: "pemakan_berat",
    isCoverCrop: false,
  },
  {
    id: "crop-kacang-panjang",
    commonName: "Kacang Panjang",
    familyId: "fam-fabaceae",
    family: {
      id: "fam-fabaceae",
      name: "Fabaceae",
      commonName: "Polong-polongan",
      rotationGroup: "Legum",
      nutrientDemands: "penambat_nitrogen",
    },
    nutrientCategory: "penyubur_nitrogen",
    isCoverCrop: false,
  },
  {
    id: "crop-pakcoy",
    commonName: "Pakcoy",
    familyId: "fam-brassicaceae",
    family: {
      id: "fam-brassicaceae",
      name: "Brassicaceae",
      commonName: "Kubis-kubisan",
      rotationGroup: "Daun",
      nutrientDemands: "sedang",
    },
    nutrientCategory: "pemakan_sedang",
    isCoverCrop: false,
  },
  {
    id: "crop-wortel",
    commonName: "Wortel",
    familyId: "fam-apiaceae",
    family: {
      id: "fam-apiaceae",
      name: "Apiaceae",
      commonName: "Wortel-wortelan",
      rotationGroup: "Umbi",
      nutrientDemands: "rendah",
    },
    nutrientCategory: "pemakan_ringan",
    isCoverCrop: false,
  },
];

describe("evaluateCropRotation Engine", () => {
  it("should handle empty planting history by offering starter recommendations and transparent notice", () => {
    const result = evaluateCropRotation({
      plotName: "Bedeng Baru",
      plantingsHistory: [],
      observations: [],
      catalogCrops: sampleCatalog,
    });

    expect(result.hasSufficientData).toBe(false);
    expect(result.primarySuggestion).not.toBeNull();
    expect(result.statusMessage).toContain("Belum ada riwayat penanaman");
    expect(result.caveatsAndLimitations.length).toBeGreaterThan(0);
  });

  it("should recommend legume (nitrogen-fixer) after heavy feeder crop (Solanaceae / Tomat)", () => {
    const plantings: PlantingRecord[] = [
      {
        id: "p1",
        plotId: "plot-1",
        cropId: "crop-tomat",
        startDate: "2026-01-01",
        status: "dipanen",
        crop: sampleCatalog[0], // Tomat (Solanaceae, pemakan_berat)
      },
    ];

    const result = evaluateCropRotation({
      plotName: "Bedeng 1",
      plantingsHistory: plantings,
      observations: [],
      catalogCrops: sampleCatalog,
    });

    expect(result.hasSufficientData).toBe(true);
    // Primary suggestion should be Kacang Panjang (Legum / Penyubur Nitrogen)
    expect(result.primarySuggestion?.crop.id).toBe("crop-kacang-panjang");
    // Tomat and Cabai should be discouraged because same family (Solanaceae) and heavy feeder
    const discouragedIds = result.discouragedCrops.map((d) => d.crop.id);
    expect(discouragedIds).toContain("crop-cabai");
  });

  it("should recommend leaf crop (Brassicaceae / Pakcoy) after legume (Fabaceae) to use fixed nitrogen", () => {
    const plantings: PlantingRecord[] = [
      {
        id: "p2",
        plotId: "plot-2",
        cropId: "crop-kacang-panjang",
        startDate: "2026-02-01",
        status: "dipanen",
        crop: sampleCatalog[2], // Kacang Panjang (penyubur_nitrogen)
      },
    ];

    const result = evaluateCropRotation({
      plotName: "Bedeng 2",
      plantingsHistory: plantings,
      observations: [],
      catalogCrops: sampleCatalog,
    });

    expect(result.hasSufficientData).toBe(true);
    // Should prefer Pakcoy (pemakan_sedang) to take advantage of nitrogen left in soil
    expect(result.primarySuggestion?.crop.id).toBe("crop-pakcoy");
  });

  it("should warn and discourage Solanaceae crops if plot observations report bacterial wilt (layu bakteri)", () => {
    const plantings: PlantingRecord[] = [
      {
        id: "p3",
        plotId: "plot-3",
        cropId: "crop-pakcoy",
        startDate: "2026-01-01",
        status: "dipanen",
        crop: sampleCatalog[3], // Pakcoy
      },
    ];

    const observations: ObservationRecord[] = [
      {
        id: "obs1",
        plotId: "plot-3",
        category: "penyakit",
        severity: "berat",
        description: "Ditemukan gejala layu bakteri pada sisa tanaman terung di sudut petak",
        date: "2026-02-10",
      },
    ];

    const result = evaluateCropRotation({
      plotName: "Bedeng 3",
      plantingsHistory: plantings,
      observations,
      catalogCrops: sampleCatalog,
    });

    // Solanaceae crops should be discouraged due to bacterial wilt in observation
    const discouragedSolanaceae = result.discouragedCrops.find(
      (d) => d.crop.familyId === "fam-solanaceae"
    );
    expect(discouragedSolanaceae).toBeDefined();
    expect(discouragedSolanaceae?.reason).toContain("layu");
  });
});

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plots, plantings, crops, plantFamilies, observations } from "@/db/schema";
import { evaluateCropRotation, CropData, PlantingRecord, ObservationRecord } from "@/lib/rotation-engine";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const { plotId, targetSeasonName } = body;

    if (!plotId) {
      return NextResponse.json({ success: false, error: "Petak wajib dipilih" }, { status: 400 });
    }

    // Ambil data petak
    const plot = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, plotId), eq(plots.farmId, auth.farm.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak ditemukan" }, { status: 404 });
    }

    // Ambil semua tanaman dari katalog beserta keluarganya
    const allCropsRaw = await db
      .select({
        id: crops.id,
        commonName: crops.commonName,
        scientificName: crops.scientificName,
        familyId: crops.familyId,
        nutrientCategory: crops.nutrientCategory,
        isCoverCrop: crops.isCoverCrop,
        daysToMaturity: crops.daysToMaturity,
        spacing: crops.spacing,
        waterNeeds: crops.waterNeeds,
        sunlightNeeds: crops.sunlightNeeds,
        companionPlants: crops.companionPlants,
        antagonistPlants: crops.antagonistPlants,
        guidelines: crops.guidelines,
        isCustom: crops.isCustom,
        familyName: plantFamilies.name,
        familyCommonName: plantFamilies.commonName,
        familyRotationGroup: plantFamilies.rotationGroup,
        familyNutrientDemands: plantFamilies.nutrientDemands,
        familyCommonPests: plantFamilies.commonPests,
        familyDescription: plantFamilies.description,
      })
      .from(crops)
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id));

    const catalogCrops: CropData[] = allCropsRaw.map((c) => ({
      id: c.id,
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
      family: c.familyId
        ? {
            id: c.familyId,
            name: c.familyName || "",
            commonName: c.familyCommonName || "",
            rotationGroup: c.familyRotationGroup || "",
            nutrientDemands: c.familyNutrientDemands || "",
            commonPests: c.familyCommonPests,
            description: c.familyDescription,
          }
        : null,
    }));

    // Ambil riwayat penanaman pada petak ini
    const plotPlantingsRaw = await db
      .select({
        id: plantings.id,
        plotId: plantings.plotId,
        cropId: plantings.cropId,
        startDate: plantings.startDate,
        harvestDate: plantings.harvestDate,
        status: plantings.status,
        cropCommonName: crops.commonName,
        cropScientificName: crops.scientificName,
        cropFamilyId: crops.familyId,
        cropNutrientCategory: crops.nutrientCategory,
        cropIsCoverCrop: crops.isCoverCrop,
        cropDaysToMaturity: crops.daysToMaturity,
        cropFamilyName: plantFamilies.name,
        cropFamilyCommonName: plantFamilies.commonName,
        cropRotationGroup: plantFamilies.rotationGroup,
        cropNutrientDemands: plantFamilies.nutrientDemands,
      })
      .from(plantings)
      .leftJoin(crops, eq(plantings.cropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .where(eq(plantings.plotId, plotId))
      .orderBy(desc(plantings.startDate));

    const plantingsHistory: PlantingRecord[] = plotPlantingsRaw.map((p) => ({
      id: p.id,
      plotId: p.plotId,
      cropId: p.cropId,
      startDate: p.startDate,
      harvestDate: p.harvestDate,
      status: p.status,
      crop: p.cropCommonName
        ? {
            id: p.cropId,
            commonName: p.cropCommonName,
            scientificName: p.cropScientificName,
            familyId: p.cropFamilyId,
            nutrientCategory: p.cropNutrientCategory || "pemakan_sedang",
            isCoverCrop: p.cropIsCoverCrop || false,
            daysToMaturity: p.cropDaysToMaturity,
            family: p.cropFamilyId
              ? {
                  id: p.cropFamilyId,
                  name: p.cropFamilyName || "",
                  commonName: p.cropFamilyCommonName || "",
                  rotationGroup: p.cropRotationGroup || "",
                  nutrientDemands: p.cropNutrientDemands || "",
                }
              : null,
          }
        : null,
    }));

    // Ambil observasi petak
    const plotObsRaw = await db
      .select()
      .from(observations)
      .where(eq(observations.plotId, plotId))
      .orderBy(desc(observations.date));

    const obsRecords: ObservationRecord[] = plotObsRaw.map((o) => ({
      id: o.id,
      plotId: o.plotId,
      category: o.category,
      severity: o.severity,
      description: o.description,
      date: o.date,
    }));

    // Jalankan mesin aturan rotasi
    const evaluation = evaluateCropRotation({
      plotName: plot.name,
      plantingsHistory,
      observations: obsRecords,
      catalogCrops,
      targetSeasonName,
    });

    return NextResponse.json({
      success: true,
      data: {
        plot,
        evaluation,
        recentPlantings: plantingsHistory.slice(0, 3),
        allCatalogCrops: catalogCrops,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengevaluasi saran rotasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

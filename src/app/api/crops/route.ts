import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { crops, plantFamilies } from "@/db/schema";
import { cropSchema } from "@/lib/validations";
import { eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const familyId = searchParams.get("familyId");
    const nutrientCategory = searchParams.get("nutrientCategory");
    const isCoverCrop = searchParams.get("isCoverCrop");

    const allCrops = await db
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
        isDemo: crops.isDemo,
        createdAt: crops.createdAt,
        family: {
          id: plantFamilies.id,
          name: plantFamilies.name,
          commonName: plantFamilies.commonName,
          rotationGroup: plantFamilies.rotationGroup,
          nutrientDemands: plantFamilies.nutrientDemands,
          commonPests: plantFamilies.commonPests,
          description: plantFamilies.description,
        },
      })
      .from(crops)
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .orderBy(crops.commonName);

    // Filter in-memory for flexible multi-tag filtering
    let filtered = allCrops;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.commonName.toLowerCase().includes(q) ||
          (c.scientificName && c.scientificName.toLowerCase().includes(q)) ||
          (c.family?.name && c.family.name.toLowerCase().includes(q)) ||
          (c.family?.commonName && c.family.commonName.toLowerCase().includes(q))
      );
    }

    if (familyId && familyId !== "all") {
      filtered = filtered.filter((c) => c.familyId === familyId);
    }

    if (nutrientCategory && nutrientCategory !== "all") {
      filtered = filtered.filter((c) => c.nutrientCategory === nutrientCategory);
    }

    if (isCoverCrop === "true") {
      filtered = filtered.filter((c) => c.isCoverCrop);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil katalog tanaman";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = cropSchema.parse(body);

    const cropId = `crop-custom-${Date.now()}`;
    const [newCrop] = await db
      .insert(crops)
      .values({
        id: cropId,
        commonName: validated.commonName,
        scientificName: validated.scientificName || null,
        familyId: validated.familyId || null,
        nutrientCategory: validated.nutrientCategory,
        isCoverCrop: validated.isCoverCrop,
        daysToMaturity: validated.daysToMaturity || null,
        spacing: validated.spacing || null,
        waterNeeds: validated.waterNeeds || null,
        sunlightNeeds: validated.sunlightNeeds || null,
        companionPlants: validated.companionPlants || null,
        antagonistPlants: validated.antagonistPlants || null,
        guidelines: validated.guidelines || null,
        isCustom: true,
        isDemo: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Tanaman "${newCrop.commonName}" berhasil ditambahkan ke katalog`,
      data: newCrop,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menambah tanaman baru";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

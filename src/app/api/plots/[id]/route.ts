import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plots, plantings, crops, plantFamilies, soilTests, observations, rotationPlans } from "@/db/schema";
import { plotSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();

    const [plot] = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, id), eq(plots.farmId, auth.farm.id)))
      .limit(1);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak ditemukan" }, { status: 404 });
    }

    // Riwayat penanaman lengkap
    const plotPlantings = await db
      .select({
        id: plantings.id,
        startDate: plantings.startDate,
        harvestDate: plantings.harvestDate,
        status: plantings.status,
        harvestYield: plantings.harvestYield,
        yieldUnit: plantings.yieldUnit,
        notes: plantings.notes,
        cropId: plantings.cropId,
        cropName: crops.commonName,
        scientificName: crops.scientificName,
        nutrientCategory: crops.nutrientCategory,
        isCoverCrop: crops.isCoverCrop,
        familyId: crops.familyId,
        familyName: plantFamilies.name,
        familyCommonName: plantFamilies.commonName,
        rotationGroup: plantFamilies.rotationGroup,
      })
      .from(plantings)
      .leftJoin(crops, eq(plantings.cropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .where(eq(plantings.plotId, id))
      .orderBy(desc(plantings.startDate));

    // Hasil uji tanah
    const plotSoilTests = await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.plotId, id))
      .orderBy(desc(soilTests.testDate));

    // Observasi lapangan
    const plotObservations = await db
      .select()
      .from(observations)
      .where(eq(observations.plotId, id))
      .orderBy(desc(observations.date));

    // Rencana rotasi
    const plotRotationPlans = await db
      .select({
        id: rotationPlans.id,
        seasonName: rotationPlans.seasonName,
        targetPeriod: rotationPlans.targetPeriod,
        plannedCropId: rotationPlans.plannedCropId,
        status: rotationPlans.status,
        recommendationReason: rotationPlans.recommendationReason,
        notes: rotationPlans.notes,
        createdAt: rotationPlans.createdAt,
        cropName: crops.commonName,
        cropFamily: plantFamilies.name,
      })
      .from(rotationPlans)
      .leftJoin(crops, eq(rotationPlans.plannedCropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .where(eq(rotationPlans.plotId, id))
      .orderBy(desc(rotationPlans.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        ...plot,
        plantings: plotPlantings,
        soilTests: plotSoilTests,
        observations: plotObservations,
        rotationPlans: plotRotationPlans,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data detail petak";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = plotSchema.parse(body);

    const [updated] = await db
      .update(plots)
      .set({
        name: validated.name,
        size: validated.size.toString(),
        unit: validated.unit,
        soilType: validated.soilType || null,
        sunlight: validated.sunlight || null,
        notes: validated.notes || null,
        status: validated.status || "aktif",
        updatedAt: new Date(),
      })
      .where(and(eq(plots.id, id), eq(plots.farmId, auth.farm.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Petak tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Data petak berhasil diperbarui",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui petak";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();

    const [plot] = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, id), eq(plots.farmId, auth.farm.id)))
      .limit(1);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak ditemukan" }, { status: 404 });
    }

    // Periksa riwayat tanaman dan uji tanah
    const plantingCount = await db
      .select()
      .from(plantings)
      .where(eq(plantings.plotId, id))
      .then((r) => r.length);

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (plantingCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `Petak "${plot.name}" memiliki ${plantingCount} riwayat tanaman. Harap konfirmasi penghapusan secara sadar untuk mencegah kehilangan data riwayat petak.`,
          hasData: true,
          count: plantingCount,
        },
        { status: 400 }
      );
    }

    await db.delete(plots).where(eq(plots.id, id));

    return NextResponse.json({
      success: true,
      message: `Petak "${plot.name}" berhasil dihapus`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus petak";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

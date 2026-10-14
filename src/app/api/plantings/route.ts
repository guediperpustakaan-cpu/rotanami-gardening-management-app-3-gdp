import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plantings, crops, plantFamilies, plots } from "@/db/schema";
import { plantingSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get("plotId");
    const status = searchParams.get("status");

    // Ambil semua petak dari kebun aktif
    const userPlots = await db
      .select({ id: plots.id, name: plots.name })
      .from(plots)
      .where(eq(plots.farmId, auth.farm.id));

    const plotIds = userPlots.map((p) => p.id);
    if (plotIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const query = db
      .select({
        id: plantings.id,
        plotId: plantings.plotId,
        plotName: plots.name,
        cropId: plantings.cropId,
        cropName: crops.commonName,
        scientificName: crops.scientificName,
        nutrientCategory: crops.nutrientCategory,
        isCoverCrop: crops.isCoverCrop,
        familyId: crops.familyId,
        familyName: plantFamilies.name,
        familyCommonName: plantFamilies.commonName,
        seasonId: plantings.seasonId,
        startDate: plantings.startDate,
        harvestDate: plantings.harvestDate,
        status: plantings.status,
        harvestYield: plantings.harvestYield,
        yieldUnit: plantings.yieldUnit,
        notes: plantings.notes,
        createdAt: plantings.createdAt,
      })
      .from(plantings)
      .innerJoin(plots, eq(plantings.plotId, plots.id))
      .leftJoin(crops, eq(plantings.cropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .orderBy(desc(plantings.startDate));

    const records = await query;

    let filtered = records.filter((r) => plotIds.includes(r.plotId));
    if (plotId) {
      filtered = filtered.filter((r) => r.plotId === plotId);
    }
    if (status && status !== "all") {
      filtered = filtered.filter((r) => r.status === status);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil riwayat penanaman";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = plantingSchema.parse(body);

    // Verifikasi petak milik kebun aktif
    const plot = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, validated.plotId), eq(plots.farmId, auth.farm.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak valid atau bukan milik kebun Anda" }, { status: 400 });
    }

    const plantingId = `plt-${Date.now()}`;
    const [newPlanting] = await db
      .insert(plantings)
      .values({
        id: plantingId,
        plotId: validated.plotId,
        cropId: validated.cropId,
        seasonId: validated.seasonId || null,
        startDate: validated.startDate,
        harvestDate: validated.harvestDate || null,
        status: validated.status || "ditanam",
        harvestYield: validated.harvestYield != null ? validated.harvestYield.toString() : null,
        yieldUnit: validated.yieldUnit || null,
        notes: validated.notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Riwayat tanam berhasil dicatat",
      data: newPlanting,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat penanaman";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

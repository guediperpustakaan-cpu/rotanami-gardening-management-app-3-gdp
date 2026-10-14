import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plots, plantings, crops, plantFamilies, soilTests, observations } from "@/db/schema";
import { plotSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const farmId = auth.farm.id;

    // Ambil semua petak pada kebun aktif
    const farmPlots = await db
      .select()
      .from(plots)
      .where(eq(plots.farmId, farmId))
      .orderBy(plots.createdAt);

    // Ambil riwayat penanaman terbaru dan uji tanah terbaru untuk tiap petak
    const enrichedPlots = await Promise.all(
      farmPlots.map(async (plot) => {
        // Tanaman terakhir
        const recentPlantings = await db
          .select({
            id: plantings.id,
            startDate: plantings.startDate,
            harvestDate: plantings.harvestDate,
            status: plantings.status,
            cropId: plantings.cropId,
            cropName: crops.commonName,
            scientificName: crops.scientificName,
            nutrientCategory: crops.nutrientCategory,
            familyId: crops.familyId,
            familyName: plantFamilies.name,
            familyCommonName: plantFamilies.commonName,
          })
          .from(plantings)
          .leftJoin(crops, eq(plantings.cropId, crops.id))
          .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
          .where(eq(plantings.plotId, plot.id))
          .orderBy(desc(plantings.startDate))
          .limit(3);

        // Tes tanah terakhir
        const latestSoilTest = await db
          .select()
          .from(soilTests)
          .where(eq(soilTests.plotId, plot.id))
          .orderBy(desc(soilTests.testDate))
          .limit(1)
          .then((res) => res[0] || null);

        // Hitung total observasi
        const obsCount = await db
          .select()
          .from(observations)
          .where(eq(observations.plotId, plot.id))
          .then((res) => res.length);

        return {
          ...plot,
          recentPlantings,
          currentOrLatestPlanting: recentPlantings[0] || null,
          latestSoilTest,
          observationsCount: obsCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: enrichedPlots });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar petak";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = plotSchema.parse(body);

    const plotId = `plot-${Date.now()}`;
    const [newPlot] = await db
      .insert(plots)
      .values({
        id: plotId,
        farmId: auth.farm.id,
        name: validated.name,
        size: validated.size.toString(),
        unit: validated.unit,
        soilType: validated.soilType || null,
        sunlight: validated.sunlight || null,
        notes: validated.notes || null,
        status: validated.status || "aktif",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Petak berhasil ditambahkan",
      data: newPlot,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat petak baru";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

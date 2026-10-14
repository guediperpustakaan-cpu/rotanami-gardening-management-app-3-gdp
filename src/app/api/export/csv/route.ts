import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plantings, crops, plantFamilies, plots, soilTests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escapeCsvField(val: unknown): string {
  if (val == null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "plantings"; // "plantings" | "soil_tests"

    const userPlots = await db
      .select({ id: plots.id, name: plots.name })
      .from(plots)
      .where(eq(plots.farmId, auth.farm.id));

    const plotIds = userPlots.map((p) => p.id);
    const today = new Date().toISOString().slice(0, 10);

    if (type === "soil_tests") {
      const tests = await db
        .select({
          id: soilTests.id,
          plotName: plots.name,
          testDate: soilTests.testDate,
          ph: soilTests.ph,
          nitrogenPpm: soilTests.nitrogenPpm,
          nitrogenCategory: soilTests.nitrogenCategory,
          phosphorusPpm: soilTests.phosphorusPpm,
          phosphorusCategory: soilTests.phosphorusCategory,
          potassiumPpm: soilTests.potassiumPpm,
          potassiumCategory: soilTests.potassiumCategory,
          organicMatterPercent: soilTests.organicMatterPercent,
          testMethod: soilTests.testMethod,
          notes: soilTests.notes,
        })
        .from(soilTests)
        .innerJoin(plots, eq(soilTests.plotId, plots.id))
        .orderBy(desc(soilTests.testDate));

      const filteredTests = tests.filter((t) => plotIds.includes(t.id) || userPlots.some(p => p.name === t.plotName));

      const headers = [
        "ID",
        "Nama Petak",
        "Tanggal Uji",
        "pH Tanah",
        "Nitrogen (ppm)",
        "Kategori Nitrogen",
        "Fosfor (ppm)",
        "Kategori Fosfor",
        "Kalium (ppm)",
        "Kategori Kalium",
        "Bahan Organik (%)",
        "Metode Uji",
        "Catatan",
      ];

      const rows = filteredTests.map((t) => [
        escapeCsvField(t.id),
        escapeCsvField(t.plotName),
        escapeCsvField(t.testDate),
        escapeCsvField(t.ph ?? "-"),
        escapeCsvField(t.nitrogenPpm ?? "-"),
        escapeCsvField(t.nitrogenCategory ?? "-"),
        escapeCsvField(t.phosphorusPpm ?? "-"),
        escapeCsvField(t.phosphorusCategory ?? "-"),
        escapeCsvField(t.potassiumPpm ?? "-"),
        escapeCsvField(t.potassiumCategory ?? "-"),
        escapeCsvField(t.organicMatterPercent ? `${t.organicMatterPercent}%` : "-"),
        escapeCsvField(t.testMethod ?? "-"),
        escapeCsvField(t.notes ?? "-"),
      ]);

      const csvContent = "\uFEFF" + [headers.map(escapeCsvField).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rotanami_uji_tanah_${today}.csv"`,
        },
      });
    }

    // Default: riwayat penanaman
    const list = await db
      .select({
        id: plantings.id,
        plotName: plots.name,
        cropName: crops.commonName,
        scientificName: crops.scientificName,
        familyName: plantFamilies.name,
        nutrientCategory: crops.nutrientCategory,
        startDate: plantings.startDate,
        harvestDate: plantings.harvestDate,
        status: plantings.status,
        harvestYield: plantings.harvestYield,
        yieldUnit: plantings.yieldUnit,
        notes: plantings.notes,
      })
      .from(plantings)
      .innerJoin(plots, eq(plantings.plotId, plots.id))
      .leftJoin(crops, eq(plantings.cropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .orderBy(desc(plantings.startDate));

    const filteredPlantings = list.filter((p) => userPlots.some(up => up.name === p.plotName));

    const headers = [
      "ID",
      "Nama Petak",
      "Tanaman",
      "Nama Ilmiah",
      "Keluarga Botani",
      "Kategori Kebutuhan Hara",
      "Tanggal Tanam",
      "Tanggal Panen",
      "Status",
      "Hasil Panen",
      "Satuan",
      "Catatan",
    ];

    const rows = filteredPlantings.map((p) => [
      escapeCsvField(p.id),
      escapeCsvField(p.plotName),
      escapeCsvField(p.cropName ?? "-"),
      escapeCsvField(p.scientificName ?? "-"),
      escapeCsvField(p.familyName ?? "-"),
      escapeCsvField(p.nutrientCategory ?? "-"),
      escapeCsvField(p.startDate),
      escapeCsvField(p.harvestDate ?? "-"),
      escapeCsvField(p.status),
      escapeCsvField(p.harvestYield ?? "-"),
      escapeCsvField(p.yieldUnit ?? "-"),
      escapeCsvField(p.notes ?? "-"),
    ]);

    const csvContent = "\uFEFF" + [headers.map(escapeCsvField).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rotanami_riwayat_tanam_${today}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengekspor data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { soilTests, plots } from "@/db/schema";
import { soilTestSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get("plotId");

    // Ambil petak kebun aktif
    const userPlots = await db
      .select({ id: plots.id, name: plots.name })
      .from(plots)
      .where(eq(plots.farmId, auth.farm.id));

    const plotIds = userPlots.map((p) => p.id);
    if (plotIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const query = await db
      .select({
        id: soilTests.id,
        plotId: soilTests.plotId,
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
        createdAt: soilTests.createdAt,
      })
      .from(soilTests)
      .innerJoin(plots, eq(soilTests.plotId, plots.id))
      .orderBy(desc(soilTests.testDate));

    let filtered = query.filter((t) => plotIds.includes(t.plotId));
    if (plotId) {
      filtered = filtered.filter((t) => t.plotId === plotId);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data uji tanah";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = soilTestSchema.parse(body);

    // Verifikasi petak milik kebun aktif
    const plot = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, validated.plotId), eq(plots.farmId, auth.farm.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak valid" }, { status: 400 });
    }

    const testId = `soil-${Date.now()}`;
    const [newTest] = await db
      .insert(soilTests)
      .values({
        id: testId,
        plotId: validated.plotId,
        testDate: validated.testDate,
        ph: validated.ph != null ? validated.ph.toString() : null,
        nitrogenPpm: validated.nitrogenPpm != null ? validated.nitrogenPpm.toString() : null,
        nitrogenCategory: validated.nitrogenCategory || null,
        phosphorusPpm: validated.phosphorusPpm != null ? validated.phosphorusPpm.toString() : null,
        phosphorusCategory: validated.phosphorusCategory || null,
        potassiumPpm: validated.potassiumPpm != null ? validated.potassiumPpm.toString() : null,
        potassiumCategory: validated.potassiumCategory || null,
        organicMatterPercent: validated.organicMatterPercent != null ? validated.organicMatterPercent.toString() : null,
        testMethod: validated.testMethod || null,
        notes: validated.notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Hasil uji tanah berhasil disimpan",
      data: newTest,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan hasil uji tanah";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

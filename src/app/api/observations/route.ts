import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { observations, plots, plantings, crops } from "@/db/schema";
import { observationSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get("plotId");
    const category = searchParams.get("category");

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
        id: observations.id,
        plotId: observations.plotId,
        plotName: plots.name,
        plantingId: observations.plantingId,
        cropName: crops.commonName,
        category: observations.category,
        date: observations.date,
        severity: observations.severity,
        description: observations.description,
        actionTaken: observations.actionTaken,
        createdAt: observations.createdAt,
      })
      .from(observations)
      .innerJoin(plots, eq(observations.plotId, plots.id))
      .leftJoin(plantings, eq(observations.plantingId, plantings.id))
      .leftJoin(crops, eq(plantings.cropId, crops.id))
      .orderBy(desc(observations.date));

    let filtered = query.filter((o) => plotIds.includes(o.plotId));
    if (plotId) {
      filtered = filtered.filter((o) => o.plotId === plotId);
    }
    if (category && category !== "all") {
      filtered = filtered.filter((o) => o.category === category);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data observasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = observationSchema.parse(body);

    const plot = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, validated.plotId), eq(plots.farmId, auth.farm.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak valid" }, { status: 400 });
    }

    const obsId = `obs-${Date.now()}`;
    const [newObs] = await db
      .insert(observations)
      .values({
        id: obsId,
        plotId: validated.plotId,
        plantingId: validated.plantingId || null,
        category: validated.category,
        date: validated.date,
        severity: validated.severity || null,
        description: validated.description,
        actionTaken: validated.actionTaken || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Catatan observasi berhasil ditambahkan",
      data: newObs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menambahkan observasi";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

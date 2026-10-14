import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { rotationPlans, plots, crops, plantFamilies } from "@/db/schema";
import { rotationPlanSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get("plotId");

    const userPlots = await db
      .select({ id: plots.id, name: plots.name })
      .from(plots)
      .where(eq(plots.farmId, auth.farm.id));

    const plotIds = userPlots.map((p) => p.id);
    if (plotIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const plans = await db
      .select({
        id: rotationPlans.id,
        plotId: rotationPlans.plotId,
        plotName: plots.name,
        seasonName: rotationPlans.seasonName,
        targetPeriod: rotationPlans.targetPeriod,
        plannedCropId: rotationPlans.plannedCropId,
        cropName: crops.commonName,
        scientificName: crops.scientificName,
        nutrientCategory: crops.nutrientCategory,
        familyId: crops.familyId,
        familyName: plantFamilies.name,
        status: rotationPlans.status,
        recommendationReason: rotationPlans.recommendationReason,
        notes: rotationPlans.notes,
        createdAt: rotationPlans.createdAt,
      })
      .from(rotationPlans)
      .innerJoin(plots, eq(rotationPlans.plotId, plots.id))
      .leftJoin(crops, eq(rotationPlans.plannedCropId, crops.id))
      .leftJoin(plantFamilies, eq(crops.familyId, plantFamilies.id))
      .orderBy(desc(rotationPlans.createdAt));

    let filtered = plans.filter((p) => plotIds.includes(p.plotId));
    if (plotId) {
      filtered = filtered.filter((p) => p.plotId === plotId);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar rencana rotasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = rotationPlanSchema.parse(body);

    // Verifikasi petak
    const plot = await db
      .select()
      .from(plots)
      .where(and(eq(plots.id, validated.plotId), eq(plots.farmId, auth.farm.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!plot) {
      return NextResponse.json({ success: false, error: "Petak tidak valid" }, { status: 400 });
    }

    const planId = `rot-${Date.now()}`;
    const [newPlan] = await db
      .insert(rotationPlans)
      .values({
        id: planId,
        plotId: validated.plotId,
        seasonName: validated.seasonName,
        targetPeriod: validated.targetPeriod,
        plannedCropId: validated.plannedCropId,
        status: validated.status || "draf",
        recommendationReason: validated.recommendationReason,
        notes: validated.notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Rencana rotasi tanaman berhasil disimpan",
      data: newPlan,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan rencana rotasi";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

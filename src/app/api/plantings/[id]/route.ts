import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { plantings, plots } from "@/db/schema";
import { plantingSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ success: false, error: "Petak tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(plantings)
      .set({
        cropId: validated.cropId,
        startDate: validated.startDate,
        harvestDate: validated.harvestDate || null,
        status: validated.status,
        harvestYield: validated.harvestYield != null ? validated.harvestYield.toString() : null,
        yieldUnit: validated.yieldUnit || null,
        notes: validated.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(plantings.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Data penanaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Riwayat tanam berhasil diperbarui",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui riwayat penanaman";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(plantings).where(eq(plantings.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Data penanaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Catatan penanaman berhasil dihapus",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus catatan penanaman";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

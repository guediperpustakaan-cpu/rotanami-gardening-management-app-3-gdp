import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { crops, plantings, rotationPlans } from "@/db/schema";
import { cropSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = cropSchema.parse(body);

    const [updated] = await db
      .update(crops)
      .set({
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
      })
      .where(eq(crops.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Tanaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Tanaman "${updated.commonName}" berhasil diperbarui`,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui data tanaman";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cek apakah tanaman digunakan di riwayat tanaman atau rencana rotasi
    const usedInPlantings = await db
      .select()
      .from(plantings)
      .where(eq(plantings.cropId, id))
      .limit(1)
      .then((r) => r.length > 0);

    const usedInPlans = await db
      .select()
      .from(rotationPlans)
      .where(eq(rotationPlans.plannedCropId, id))
      .limit(1)
      .then((r) => r.length > 0);

    if (usedInPlantings || usedInPlans) {
      return NextResponse.json(
        {
          success: false,
          error: "Tanaman ini tidak dapat dihapus karena tercatat dalam riwayat penanaman atau rencana rotasi.",
        },
        { status: 400 }
      );
    }

    const [deleted] = await db.delete(crops).where(eq(crops.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Tanaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Tanaman "${deleted.commonName}" berhasil dihapus dari katalog`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus tanaman";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

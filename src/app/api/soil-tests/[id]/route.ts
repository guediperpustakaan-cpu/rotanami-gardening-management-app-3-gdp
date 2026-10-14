import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { soilTests } from "@/db/schema";
import { soilTestSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = soilTestSchema.parse(body);

    const [updated] = await db
      .update(soilTests)
      .set({
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
      .where(eq(soilTests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Data uji tanah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hasil uji tanah berhasil diperbarui",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui hasil uji tanah";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(soilTests).where(eq(soilTests.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Data uji tanah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Hasil uji tanah berhasil dihapus" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus uji tanah";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

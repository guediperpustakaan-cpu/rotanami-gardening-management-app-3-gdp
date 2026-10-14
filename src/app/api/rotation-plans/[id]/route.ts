import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rotationPlans } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const [updated] = await db
      .update(rotationPlans)
      .set({
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      })
      .where(eq(rotationPlans.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Rencana rotasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Status rencana rotasi berhasil diperbarui",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui rencana rotasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(rotationPlans).where(eq(rotationPlans.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Rencana rotasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Rencana rotasi berhasil dihapus" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus rencana rotasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

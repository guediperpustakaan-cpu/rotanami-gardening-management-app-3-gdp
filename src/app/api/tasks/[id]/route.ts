import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { completed } = body;

    const [updated] = await db
      .update(tasks)
      .set({
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null,
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: updated.completed ? "Tugas ditandai selesai" : "Tugas diaktifkan kembali",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui status tugas";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tugas berhasil dihapus" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus tugas";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

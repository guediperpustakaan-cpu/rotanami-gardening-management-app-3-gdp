import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { observations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(observations).where(eq(observations.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Observasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Catatan observasi berhasil dihapus" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus observasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

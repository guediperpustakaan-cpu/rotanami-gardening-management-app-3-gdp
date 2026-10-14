import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { farms, plots } from "@/db/schema";
import { farmSchema } from "@/lib/validations";
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
    const validated = farmSchema.parse(body);

    const [updated] = await db
      .update(farms)
      .set({
        name: validated.name,
        location: validated.location || null,
        description: validated.description || null,
        timezone: validated.timezone,
        updatedAt: new Date(),
      })
      .where(and(eq(farms.id, id), eq(farms.userId, auth.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Kebun tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profil kebun berhasil diperbarui", data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui kebun";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();

    // Verifikasi kepemilikan
    const farm = await db
      .select()
      .from(farms)
      .where(and(eq(farms.id, id), eq(farms.userId, auth.user.id)))
      .limit(1)
      .then((r) => r[0]);

    if (!farm) {
      return NextResponse.json({ success: false, error: "Kebun tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    // Hitung apakah ada petak
    const plotList = await db.select().from(plots).where(eq(plots.farmId, id));
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (plotList.length > 0 && !force) {
      return NextResponse.json({
        success: false,
        error: `Kebun memiliki ${plotList.length} petak. Sertakan konfirmasi eksplisit untuk menghapus kebun beserta seluruh petaknya.`,
        requiresConfirmation: true,
      }, { status: 400 });
    }

    await db.delete(farms).where(eq(farms.id, id));

    return NextResponse.json({ success: true, message: "Kebun berhasil dihapus" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus kebun";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

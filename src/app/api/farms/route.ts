import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, ACTIVE_FARM_COOKIE_NAME } from "@/lib/auth";
import { db } from "@/db";
import { farms } from "@/db/schema";
import { farmSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getAuthContext();
    const userFarms = await db
      .select()
      .from(farms)
      .where(eq(farms.userId, auth.user.id))
      .orderBy(desc(farms.createdAt));

    return NextResponse.json({ success: true, data: userFarms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar kebun";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();
    const validated = farmSchema.parse(body);

    const farmId = `farm-${Date.now()}`;
    const [newFarm] = await db
      .insert(farms)
      .values({
        id: farmId,
        userId: auth.user.id,
        name: validated.name,
        location: validated.location || null,
        description: validated.description || null,
        timezone: validated.timezone || "Asia/Jakarta",
        isDemo: false,
      })
      .returning();

    const response = NextResponse.json({
      success: true,
      message: "Kebun baru berhasil dibuat",
      data: newFarm,
    });

    // Otomatis jadikan kebun aktif
    response.cookies.set(ACTIVE_FARM_COOKIE_NAME, farmId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat kebun baru";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

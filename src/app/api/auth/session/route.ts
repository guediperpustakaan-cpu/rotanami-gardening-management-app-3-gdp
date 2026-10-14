import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, SESSION_COOKIE_NAME, ACTIVE_FARM_COOKIE_NAME, DEFAULT_USER_ID, DEFAULT_FARM_ID } from "@/lib/auth";
import { db } from "@/db";
import { users, farms } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getAuthContext();
    const userFarms = await db.select().from(farms).where(eq(farms.userId, auth.user.id));

    return NextResponse.json({
      success: true,
      data: {
        user: auth.user,
        activeFarm: auth.farm,
        farms: userFarms,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat sesi pengguna";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, farmId, userId, name, email } = body;

    const response = NextResponse.json({ success: true });

    if (action === "switch-farm" && farmId) {
      response.cookies.set(ACTIVE_FARM_COOKIE_NAME, farmId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (action === "switch-user" && userId) {
      response.cookies.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (action === "reset-demo") {
      response.cookies.set(SESSION_COOKIE_NAME, DEFAULT_USER_ID, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      response.cookies.set(ACTIVE_FARM_COOKIE_NAME, DEFAULT_FARM_ID, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (action === "update-user" && name) {
      const auth = await getAuthContext();
      await db
        .update(users)
        .set({ name, email: email || auth.user.email })
        .where(eq(users.id, auth.user.id));
      return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses sesi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

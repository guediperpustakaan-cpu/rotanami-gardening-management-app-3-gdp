import { NextResponse } from "next/server";
import { db } from "@/db";
import { plantFamilies } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(plantFamilies).orderBy(plantFamilies.name);
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar keluarga tanaman";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

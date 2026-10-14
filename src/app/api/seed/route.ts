import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Data contoh berhasil dimuat ulang ke database",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat data contoh";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/db";
import { tasks, plots } from "@/db/schema";
import { taskSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const { searchParams } = new URL(req.url);
    const completedParam = searchParams.get("completed");

    const query = await db
      .select({
        id: tasks.id,
        farmId: tasks.farmId,
        plotId: tasks.plotId,
        plotName: plots.name,
        plantingId: tasks.plantingId,
        title: tasks.title,
        category: tasks.category,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        completedAt: tasks.completedAt,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(plots, eq(tasks.plotId, plots.id))
      .where(eq(tasks.farmId, auth.farm.id))
      .orderBy(tasks.dueDate);

    let filtered = query;
    if (completedParam === "true") {
      filtered = filtered.filter((t) => t.completed);
    } else if (completedParam === "false") {
      filtered = filtered.filter((t) => !t.completed);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar tugas";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    const body = await req.json();

    const payload = {
      ...body,
      farmId: auth.farm.id,
    };

    const validated = taskSchema.parse(payload);
    const taskId = `task-${Date.now()}`;

    const [newTask] = await db
      .insert(tasks)
      .values({
        id: taskId,
        farmId: auth.farm.id,
        plotId: validated.plotId || null,
        plantingId: validated.plantingId || null,
        title: validated.title,
        category: validated.category,
        dueDate: validated.dueDate,
        completed: validated.completed || false,
        notes: validated.notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil ditambahkan",
      data: newTask,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat tugas";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

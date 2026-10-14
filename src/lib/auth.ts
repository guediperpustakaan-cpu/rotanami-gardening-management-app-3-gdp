import { cookies } from "next/headers";
import { db } from "@/db";
import { users, farms } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE_NAME = "rotanami_user_id";
export const ACTIVE_FARM_COOKIE_NAME = "rotanami_farm_id";
export const DEFAULT_USER_ID = "usr-budi-demo";
export const DEFAULT_FARM_ID = "farm-mandiri-cipagalo";

export interface CurrentAuthContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  farm: {
    id: string;
    userId: string;
    name: string;
    location?: string | null;
    description?: string | null;
    timezone: string;
    isDemo: boolean;
  };
}

export async function getAuthContext(): Promise<CurrentAuthContext> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value || DEFAULT_USER_ID;
  const farmIdCookie = cookieStore.get(ACTIVE_FARM_COOKIE_NAME)?.value || DEFAULT_FARM_ID;

  // Cari user
  let user = await db
    .select()
    .from(users)
    .where(eq(users.id, userIdCookie))
    .limit(1)
    .then((res) => res[0]);

  if (!user) {
    // Fallback ke user pertama yang ada
    const anyUser = await db.select().from(users).limit(1).then((res) => res[0]);
    if (anyUser) {
      user = anyUser;
    } else {
      // Buat user default jika database benar-benar kosong
      const newUser = {
        id: DEFAULT_USER_ID,
        name: "Pekebun Mandiri",
        email: "pekebun@rotanami.id",
        role: "pekebun",
      };
      await db.insert(users).values(newUser).onConflictDoNothing();
      user = (await db.select().from(users).where(eq(users.id, DEFAULT_USER_ID)).limit(1).then((r) => r[0]))!;
    }
  }

  // Cari farm yang dimiliki user atau farmId terpilih
  let farm = await db
    .select()
    .from(farms)
    .where(eq(farms.id, farmIdCookie))
    .limit(1)
    .then((res) => res[0]);

  if (!farm || farm.userId !== user.id) {
    const userFarm = await db
      .select()
      .from(farms)
      .where(eq(farms.userId, user.id))
      .limit(1)
      .then((res) => res[0]);

    if (userFarm) {
      farm = userFarm;
    } else {
      // Buat kebun awal jika belum ada
      const newFarm = {
        id: `farm-${Date.now()}`,
        userId: user.id,
        name: "Kebun Saya",
        location: "Indonesia",
        description: "Kebun mandiri baru",
        timezone: "Asia/Jakarta",
        isDemo: false,
      };
      await db.insert(farms).values(newFarm);
      farm = (await db.select().from(farms).where(eq(farms.id, newFarm.id)).limit(1).then((r) => r[0]))!;
    }
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    farm: {
      id: farm.id,
      userId: farm.userId,
      name: farm.name,
      location: farm.location,
      description: farm.description,
      timezone: farm.timezone,
      isDemo: farm.isDemo,
    },
  };
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

export interface FarmItem {
  id: string;
  userId: string;
  name: string;
  location?: string | null;
  description?: string | null;
  timezone: string;
  isDemo: boolean;
}

interface AppContextValue {
  user: UserProfile | null;
  activeFarm: FarmItem | null;
  farms: FarmItem[];
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  switchFarm: (farmId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeFarm, setActiveFarm] = useState<FarmItem | null>(null);
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data.user);
        setActiveFarm(json.data.activeFarm);
        setFarms(json.data.farms || []);
      }
    } catch {
      showToast("Gagal memuat sesi pengguna", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const switchFarm = async (farmId: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch-farm", farmId }),
      });
      if (res.ok) {
        await refreshSession();
        showToast("Kebun aktif berhasil dialihkan", "info");
      }
    } catch {
      showToast("Gagal mengalihkan kebun", "error");
    }
  };

  const resetDemoData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Data contoh berhasil dimuat ulang", "success");
        await refreshSession();
      } else {
        showToast(json.error || "Gagal memuat data contoh", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeFarm,
        farms,
        isLoading,
        refreshSession,
        switchFarm,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

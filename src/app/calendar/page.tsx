"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  Filter,
  Trash2,
  Clock,
  Sprout,
  FlaskConical,
  RotateCw,
  X,
  AlertCircle,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface TaskItem {
  id: string;
  farmId: string;
  plotId?: string | null;
  plotName?: string | null;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  notes?: string | null;
}

interface PlotOption {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [plots, setPlots] = useState<PlotOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    plotId: "",
    category: "pemeliharaan",
    dueDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const fetchTasksAndPlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tasksRes, plotsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/plots"),
      ]);

      const [tasksJson, plotsJson] = await Promise.all([
        tasksRes.json(),
        plotsRes.json(),
      ]);

      if (tasksJson.success) setTasks(tasksJson.data || []);
      if (plotsJson.success) setPlots(plotsJson.data || []);
    } catch {
      showToast("Gagal memuat jadwal aktivitas", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTasksAndPlots();
  }, [fetchTasksAndPlots]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: !currentStatus } : t))
        );
        showToast(!currentStatus ? "Tugas berhasil diselesaikan!" : "Tugas diaktifkan kembali", "success");
      }
    } catch {
      showToast("Gagal memperbarui status tugas", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        showToast("Tugas berhasil dihapus", "success");
      }
    } catch {
      showToast("Gagal menghapus tugas", "error");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      showToast("Judul tugas wajib diisi", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Pengingat berhasil ditambahkan", "success");
        setIsAddModalOpen(false);
        setTaskForm({
          title: "",
          plotId: "",
          category: "pemeliharaan",
          dueDate: new Date().toISOString().slice(0, 10),
          notes: "",
        });
        await fetchTasksAndPlots();
      } else {
        showToast(json.error || "Gagal membuat tugas", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "completed" ? t.completed : !t.completed;
    const matchesCategory =
      categoryFilter === "all" ? true : t.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Jadwal & Pengingat Aktivitas
            </h1>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
              {pendingCount} Tertunda
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Pantau jadwal tanam, jadwal panen, pemupukan, uji tanah, dan pemeliharaan petak.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Info notice about MVP in-app reminders */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Catatan Pengingat Dalam Aplikasi:</strong> Pengingat pada sistem ini berupa agenda kerja di dalam aplikasi dan tidak mengirimkan email atau push notification eksternal.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === "all"
                ? "bg-emerald-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === "pending"
                ? "bg-emerald-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Perlu Dilakukan ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              statusFilter === "completed"
                ? "bg-emerald-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Selesai ({tasks.length - pendingCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Kategori</option>
            <option value="tanam">Penanaman</option>
            <option value="panen">Pemanenan</option>
            <option value="pupuk">Pemupukan</option>
            <option value="uji_tanah">Uji Kesehatan Tanah</option>
            <option value="pemeliharaan">Pemeliharaan / Penyiangan</option>
            <option value="rotasi">Persiapan Rotasi</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500">Memuat jadwal aktivitas...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Tidak ada jadwal yang sesuai"
          description="Semua tugas beres atau tidak ada aktivitas pada filter yang dipilih."
          action={{
            label: "Tambah Jadwal Baru",
            onClick: () => setIsAddModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
                task.completed
                  ? "bg-stone-50/70 border-stone-200 opacity-70"
                  : "bg-white border-stone-200 shadow-xs hover:border-emerald-500"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-700 transition-colors shrink-0"
                  title={task.completed ? "Aktifkan kembali" : "Tandai selesai"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-400 hover:text-emerald-600" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        task.completed
                          ? "line-through text-stone-400"
                          : "text-stone-900"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {task.category}
                    </span>
                    {task.plotName && (
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {task.plotName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Jatuh Tempo: {task.dueDate}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-stone-600 italic pt-0.5">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus tugas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Tugas Baru */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Tambah Tugas & Pengingat</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Aktivitas / Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semprot POC daun dan pasang perangkap lalat buah"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Kategori Aktivitas
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  >
                    <option value="pemeliharaan">Pemeliharaan / Penyiangan</option>
                    <option value="tanam">Penanaman</option>
                    <option value="panen">Pemanenan</option>
                    <option value="pupuk">Pemupukan</option>
                    <option value="uji_tanah">Uji Kesehatan Tanah</option>
                    <option value="rotasi">Persiapan Rotasi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tanggal Jatuh Tempo *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Kaitkan dengan Petak (Opsional)
                </label>
                <select
                  value={taskForm.plotId}
                  onChange={(e) => setTaskForm({ ...taskForm, plotId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                >
                  <option value="">Semua Petak / Kebun Umum</option>
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Dosis 1:20 disemprotkan sebelum jam 9 pagi..."
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengingat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface SoilTestData {
  id: string;
  testDate: string;
  ph?: number | string | null;
  nitrogenPpm?: number | string | null;
  phosphorusPpm?: number | string | null;
  potassiumPpm?: number | string | null;
  testMethod?: string | null;
}

interface SoilChartProps {
  data: SoilTestData[];
  title?: string;
}

export function SoilChart({ data, title = "Tren pH Tanah" }: SoilChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200">
        <p className="text-sm text-stone-500">Belum ada data uji tanah untuk ditampilkan dalam grafik.</p>
      </div>
    );
  }

  // Sort by date ascending for timeline
  const chartData = [...data]
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .map((item) => ({
      date: item.testDate,
      ph: item.ph ? Number(item.ph) : null,
      nitrogen: item.nitrogenPpm ? Number(item.nitrogenPpm) : null,
      phosphorus: item.phosphorusPpm ? Number(item.phosphorusPpm) : null,
      potassium: item.potassiumPpm ? Number(item.potassiumPpm) : null,
      method: item.testMethod || "Uji Mandiri",
    }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-stone-900">{title}</h4>
          <p className="text-xs text-stone-500">
            Garis hijau menunjukkan rentang ideal tanaman sayuran tropis (pH 6.0 - 7.0)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
            <span className="text-stone-600 font-medium">pH Tanah</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8c8577"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e5e0d8" }}
            />
            <YAxis
              domain={[4, 9]}
              ticks={[4, 5, 6, 7, 8, 9]}
              stroke="#8c8577"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e5e0d8" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  return (
                    <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                      <p className="font-semibold text-stone-300">Tanggal: {label}</p>
                      <p className="text-emerald-400 font-bold text-sm">
                        pH: {val != null ? Number(val).toFixed(1) : "Tidak diisi"}
                      </p>
                      {payload[0].payload.method && (
                        <p className="text-stone-400 text-[11px]">
                          Metode: {payload[0].payload.method}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Rentang pH ideal */}
            <ReferenceLine y={6.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Batas Bawah Ideal (6.0)", fill: "#059669", fontSize: 10, position: "insideBottomLeft" }} />
            <ReferenceLine y={7.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Batas Atas Ideal (7.0)", fill: "#059669", fontSize: 10, position: "insideTopLeft" }} />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#15803d"
              strokeWidth={3}
              dot={{ fill: "#15803d", r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              activeDot={{ r: 7, fill: "#166534" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

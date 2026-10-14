import React from "react";

export function NutrientCategoryBadge({ category }: { category: string }) {
  switch (category) {
    case "penyubur_nitrogen":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Penyubur Nitrogen (Legum)
        </span>
      );
    case "pemakan_berat":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Pemakan Berat (Heavy Feeder)
        </span>
      );
    case "pemakan_sedang":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-900 border border-lime-300">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-600" />
          Pemakan Sedang (Sayur Daun)
        </span>
      );
    case "pemakan_ringan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-900 border border-teal-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          Pemakan Ringan (Tanaman Akar)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300">
          {category}
        </span>
      );
  }
}

export function PlantingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ditanam":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Sedang Ditanam
        </span>
      );
    case "dipanen":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
          Sudah Dipanen
        </span>
      );
    case "direncanakan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          Direncanakan
        </span>
      );
    case "dibatalkan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-300">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          Dibatalkan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
          {status}
        </span>
      );
  }
}

export function PhStatusBadge({ ph }: { ph: number | string | null | undefined }) {
  if (ph == null || ph === "") {
    return <span className="text-xs text-stone-400 italic">Belum diuji</span>;
  }
  const val = Number(ph);
  if (isNaN(val)) return <span>{ph}</span>;

  let label = "Netral Ideal";
  let color = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (val < 5.5) {
    label = "Asam Kuat";
    color = "bg-rose-100 text-rose-800 border-rose-300";
  } else if (val < 6.0) {
    label = "Agak Asam";
    color = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (val > 7.5) {
    label = "Basa";
    color = "bg-blue-100 text-blue-800 border-blue-300";
  } else if (val > 7.0) {
    label = "Agak Basa";
    color = "bg-teal-100 text-teal-800 border-teal-300";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      <span className="font-bold">pH {val.toFixed(1)}</span>
      <span className="text-[11px] opacity-80">({label})</span>
    </span>
  );
}

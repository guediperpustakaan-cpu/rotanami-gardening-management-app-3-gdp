"use client";

import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Coffee, X, Download, Copy, ExternalLink, Heart } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const TRAKTEER_URL = "https://trakteer.id/perpus_opera/";
const SOURCE_DOWNLOAD_URL = "/rotanami-source.zip";

// Pilihan nominal traktiran: mulai Rp6.000 dan kelipatannya
const DONATION_AMOUNTS = [
  { value: 6000, label: "Rp6.000" },
  { value: 12000, label: "Rp12.000" },
  { value: 18000, label: "Rp18.000" },
  { value: 24000, label: "Rp24.000" },
  { value: 36000, label: "Rp36.000" },
  { value: 60000, label: "Rp60.000" },
];

export function TrakteerWidget() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(6000);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);

  const generateQr = useCallback(async () => {
    setIsQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(TRAKTEER_URL, {
        width: 256,
        margin: 1,
        color: { dark: "#1c1917", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch {
      showToast("Gagal membuat kode QR", "error");
    } finally {
      setIsQrLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isModalOpen) {
      generateQr();
    }
  }, [isModalOpen, generateQr]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(TRAKTEER_URL);
      showToast("Tautan Trakteer berhasil disalin", "success");
    } catch {
      showToast("Gagal menyalin tautan", "error");
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <>
      {/* Floating Button - sudut kanan bawah */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Trakteer - dukung web app ini"
        className="group fixed right-4 bottom-20 lg:bottom-6 z-40 flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-600/30 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 group-hover:rotate-12 transition-transform">
          <Coffee className="w-4 h-4" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-bold">Trakteer</span>
          <span className="hidden sm:inline-block text-[10px] font-medium text-orange-50/90 max-w-[160px] truncate">
            Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap jalan
          </span>
        </span>
      </button>

      {/* Modal Traktiran */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dukung Rotanami lewat Trakteer"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header oranye khas Trakteer */}
            <div className="p-5 flex items-start gap-3 bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base flex items-center gap-2">
                  Traktiran Kopi
                  <span className="text-[10px] font-semibold bg-white/25 px-2 py-0.5 rounded-full">
                    Lewat Trakteer
                  </span>
                </h3>
                <p className="text-xs text-orange-50/95 mt-0.5 leading-relaxed">
                  Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap
                  jalan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors shrink-0"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten */}
            <div className="p-5 space-y-5">
              {/* Pilihan nominal */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2.5">
                  Pilih Nominal Traktiran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DONATION_AMOUNTS.map((amount) => {
                    const isSelected = selectedAmount === amount.value;
                    return (
                      <button
                        key={amount.value}
                        type="button"
                        onClick={() => setSelectedAmount(amount.value)}
                        className={`px-2 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                          isSelected
                            ? "bg-orange-50 border-[#F97316] text-[#C2410C] shadow-xs"
                            : "bg-stone-50 border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50/40"
                        }`}
                      >
                        {amount.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-500 mt-2.5 leading-relaxed">
                  Nominal dipilih sebagai referensi. Kamu tetap dapat menyesuaikan
                  jumlah akhir di halaman Trakteer.
                </p>
              </div>

              {/* QR Code langsung di dalam app */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-xs font-semibold text-stone-700 text-center">
                  Scan QR Code di bawah ini untuk membuka halaman traktiran{" "}
                  <span className="text-[#C2410C]">{formatRupiah(selectedAmount)}</span>
                </p>
                <div className="p-3 bg-white rounded-2xl border-2 border-stone-100 shadow-xs">
                  {isQrLoading ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-stone-100 rounded-lg animate-pulse">
                      <span className="text-xs text-stone-400 font-medium">
                        Membuat QR...
                      </span>
                    </div>
                  ) : qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt={`QR Code halaman Trakteer untuk traktiran ${formatRupiah(selectedAmount)}`}
                      width={200}
                      height={200}
                      className="block"
                    />
                  ) : null}
                </div>
                <p className="text-[11px] text-stone-500 text-center leading-relaxed max-w-[260px]">
                  Arahkan kamera ponsel ke QR untuk membuka{" "}
                  <span className="font-medium text-stone-600 break-all">
                    trakteer.id/perpus_opera
                  </span>
                </p>

                <div className="flex w-full gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Tautan</span>
                  </button>
                  <a
                    href={TRAKTEER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Trakteer</span>
                  </a>
                </div>
              </div>

              {/* Unduh Kode Sumber */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-emerald-950">
                      Kode Sumber Terbuka
                    </h4>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5 mb-2.5 leading-relaxed">
                      Seluruh kode sumber web app ini tersedia gratis untuk
                      dipelajari, disalin, dan dikembangkan sendiri.
                    </p>
                    <a
                      href={SOURCE_DOWNLOAD_URL}
                      download="rotanami-source.zip"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Source Code (.zip)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Catatan transparansi */}
              <p className="text-[11px] text-stone-500 leading-relaxed flex items-start gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Traktiran sepenuhnya sukarela dan langsung ke kanal Trakteer
                  pemilik. Web app ini tidak menyimpan data pembayaran apa pun.
                </span>
              </p>
            </div>

            {/* Footer lisensi */}
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-center">
              <p className="text-[11px] font-semibold text-stone-500 tracking-wide">
                Open Source oleh MZF - 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

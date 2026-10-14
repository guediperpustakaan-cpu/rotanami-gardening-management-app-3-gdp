"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requiresTypeConfirm?: boolean;
  typeMatchWord?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Konfirmasi Hapus",
  cancelText = "Batal",
  requiresTypeConfirm = false,
  typeMatchWord = "HAPUS",
  isDestructive = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [typedInput, setTypedInput] = useState("");

  if (!isOpen) return null;

  const isConfirmedAllowed = !requiresTypeConfirm || typedInput.trim() === typeMatchWord;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 flex items-start gap-3 bg-rose-50/50 border-b border-rose-100">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900 text-base">{title}</h3>
            <p className="text-xs text-rose-700 font-medium mt-0.5">Tindakan ini memerlukan kehati-hatian</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">{message}</p>

          {requiresTypeConfirm && (
            <div className="space-y-2 pt-2">
              <label htmlFor="confirm-typed-word" className="text-xs font-medium text-stone-700 block">
                Ketik <span className="font-bold text-rose-700 select-all">{typeMatchWord}</span> untuk melanjutkan:
              </label>
              <input
                id="confirm-typed-word"
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={`Ketik ${typeMatchWord}`}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setTypedInput("");
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!isConfirmedAllowed}
            onClick={() => {
              onConfirm();
              setTypedInput("");
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all shadow-xs ${
              !isConfirmedAllowed
                ? "bg-stone-300 cursor-not-allowed"
                : isDestructive
                ? "bg-rose-600 hover:bg-rose-700 active:scale-98"
                : "bg-emerald-700 hover:bg-emerald-800 active:scale-98"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

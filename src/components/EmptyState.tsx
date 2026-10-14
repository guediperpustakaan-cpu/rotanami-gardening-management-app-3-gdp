import React from "react";
import { Sprout } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-stone-200 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
        {icon || <Sprout className="w-7 h-7" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-500 max-w-md leading-relaxed mb-6">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {action && (
          action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              {action.label}
            </button>
          )
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

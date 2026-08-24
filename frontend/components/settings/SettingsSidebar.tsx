"use client";

import {
  Settings,
  Building2,
  CreditCard,
  FileText,
} from "lucide-react";

type SettingsSection =
  | "general"
  | "payments"
  | "documents";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export default function SettingsSidebar({
  activeSection,
  onChange,
}: SettingsSidebarProps) {
  const items = [
    {
      id: "general" as const,
      label: "Général",
      description: "Informations de LANDIS",
      icon: Building2,
    },
    {
      id: "payments" as const,
      label: "Paiements",
      description: "Modes et règles de paiement",
      icon: CreditCard,
    },
    {
      id: "documents" as const,
      label: "Documents",
      description: "Documents et contrats",
      icon: FileText,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Settings
            size={18}
            className="text-slate-500"
          />

          <span className="font-semibold text-slate-900">
            Configuration
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                <span className="block text-sm font-medium">
                  {item.label}
                </span>

                <span
                  className={`mt-0.5 block text-xs ${
                    active
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
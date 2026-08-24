"use client";

import Link from "next/link";

import {
  Users,
  Palette,
  Building2,
  Map,
  CreditCard,
  FileText,
  ShieldCheck,
  History,
} from "lucide-react";

const settings = [
  {
    title: "Utilisateurs",
    description:
      "Gérer les comptes, les rôles et les mots de passe.",
    href: "/settings/users",
    icon: Users,
  },

  {
    title: "Apparence",
    description:
      "Configurer le thème et l'apparence de LANDIS.",
    href: "/settings/appearance",
    icon: Palette,
  },

  {
    title: "Organisation",
    description:
      "Configurer les informations de l'organisation.",
    href: "/settings/organization",
    icon: Building2,
  },

  {
    title: "Lotissement",
    description:
      "Configurer les paramètres généraux du lotissement.",
    href: "/settings/lotissement",
    icon: Map,
  },

  {
    title: "Commercial",
    description:
      "Configurer les paiements et paramètres commerciaux.",
    href: "/settings/commercial",
    icon: CreditCard,
  },

  {
    title: "Documents",
    description:
      "Configurer les documents et contrats.",
    href: "/settings/documents",
    icon: FileText,
  },

  {
    title: "Sécurité",
    description:
      "Configurer les paramètres de sécurité.",
    href: "/settings/security",
    icon: ShieldCheck,
  },

  {
    title: "Historique",
    description:
      "Consulter les actions effectuées dans LANDIS.",
    href: "/settings/history",
    icon: History,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Paramètres
        </h1>

        <p className="mt-2 text-slate-500">
          Configurez et administrez la
          plateforme LANDIS.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {settings.map(
          (setting) => {
            const Icon =
              setting.icon;

            return (
              <Link
                key={setting.title}
                href={setting.href}
                className="
                  group
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-md
                "
              >
                <div
                  className="
                    mb-5
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                    text-slate-700
                    transition
                    group-hover:bg-slate-900
                    group-hover:text-white
                  "
                >
                  <Icon size={21} />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  {setting.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {setting.description}
                </p>
              </Link>
            );
          },
        )}
      </div>
    </div>
  );
}
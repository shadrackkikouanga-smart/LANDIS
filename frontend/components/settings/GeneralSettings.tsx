"use client";

import { Building2 } from "lucide-react";

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Informations générales
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Informations principales de la plateforme LANDIS.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
            <Building2 size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Identité
            </h3>

            <p className="text-sm text-slate-500">
              Informations affichées dans l'application.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nom de la plateforme
            </label>

            <input
              defaultValue="LANDIS"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Activité
            </label>

            <input
              defaultValue="Gestion foncière"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Téléphone
            </label>

            <input
              placeholder="+242 ..."
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="contact@landis.cg"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Adresse
            </label>

            <textarea
              rows={3}
              placeholder="Adresse de l'entreprise..."
              className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
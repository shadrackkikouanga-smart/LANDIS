"use client";

import { CreditCard } from "lucide-react";

export default function PaymentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Paramètres des paiements
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configurez les règles utilisées pour les paiements.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
            <CreditCard size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Modes de paiement
            </h3>

            <p className="text-sm text-slate-500">
              Modes acceptés par LANDIS.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            "Espèces",
            "Virement bancaire",
            "Mobile Money",
            "Chèque",
          ].map((mode) => (
            <label
              key={mode}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">
                {mode}
              </span>

              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Règles de paiement
        </h3>

        <div className="mt-5 space-y-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium text-slate-700">
                Générer automatiquement les reçus
              </span>

              <span className="text-xs text-slate-400">
                Un numéro de reçu est attribué automatiquement à chaque paiement.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium text-slate-700">
                Empêcher les paiements dépassant le prix
              </span>

              <span className="text-xs text-slate-400">
                LANDIS refusera un paiement supérieur au montant restant.
              </span>
            </span>
          </label>
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
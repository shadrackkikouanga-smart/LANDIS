"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBloc, updateBloc, Bloc } from "@/services/blocs";
import { getSections, Section } from "@/services/sections";

interface BlocFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  bloc?: Bloc;
}

export default function BlocForm({
  onSuccess,
  onCancel,
  bloc,
}: BlocFormProps) {
  const editing = Boolean(bloc);

  const [reference, setReference] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [nombreParcelles, setNombreParcelles] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vHaut, setVHaut] = useState("AUTRE");
  const [lHaut, setLHaut] = useState("0");

  const [vBas, setVBas] = useState("AUTRE");
  const [lBas, setLBas] = useState("0");

  const [vGauche, setVGauche] = useState("AUTRE");
  const [lGauche, setLGauche] = useState("0");

  const [vDroite, setVDroite] = useState("AUTRE");
  const [lDroite, setLDroite] = useState("0");

  useEffect(() => {
    async function loadSectionsData() {
      try {
        const data = await getSections();
        setSections(data);
      } catch (err) {
        console.error("Erreur sections:", err);
      }
    }

    loadSectionsData();
  }, []);

  useEffect(() => {
    if (bloc) {
      setReference(bloc.reference ?? "");
      setSuperficie(String(bloc.superficie ?? ""));
      setNombreParcelles(String(bloc.nombreParcelles ?? ""));

      setSectionId(String(bloc.sectionId ?? ""));

      setVHaut(bloc.voieHautType ?? "AUTRE");
      setLHaut(String(bloc.voieHautLargeur ?? "0"));

      setVBas(bloc.voieBasType ?? "AUTRE");
      setLBas(String(bloc.voieBasLargeur ?? "0"));

      setVGauche(bloc.voieGaucheType ?? "AUTRE");
      setLGauche(String(bloc.voieGaucheLargeur ?? "0"));

      setVDroite(bloc.voieDroiteType ?? "AUTRE");
      setLDroite(String(bloc.voieDroiteLargeur ?? "0"));
    }
  }, [bloc]);

  const renderVoie = (
    label: string,
    type: string,
    setType: (value: string) => void,
    larg: string,
    setLarg: (value: string) => void
  ) => (
    <div className="rounded-lg border bg-slate-50 p-3">
      <span className="mb-2 block text-xs font-bold uppercase text-slate-400">
        {label} *
      </span>

      <div className="flex gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border bg-white p-1.5 text-sm outline-none"
        >
          <option value="AUTRE">Sélectionner le type</option>
          <option value="AVENUE">Avenue</option>
          <option value="RUELLE">Ruelle</option>
        </select>

        <input
          type="number"
          min="0"
          step="0.5"
          value={larg}
          onChange={(e) => setLarg(e.target.value)}
          placeholder="Largeur (m)"
          className="w-full rounded border p-1.5 text-sm outline-none"
        />
      </div>
    </div>
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!reference.trim() || !superficie || !sectionId) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (
      !editing &&
      (!nombreParcelles || Number(nombreParcelles) <= 0)
    ) {
      setError("Le nombre de parcelles doit être supérieur à 0.");
      return;
    }

    const h = vHaut.toUpperCase();
    const b = vBas.toUpperCase();
    const g = vGauche.toUpperCase();
    const d = vDroite.toUpperCase();

    if (
      h === "AUTRE" ||
      b === "AUTRE" ||
      g === "AUTRE" ||
      d === "AUTRE"
    ) {
      setError(
        "Validation bloquée. Vous devez obligatoirement spécifier une Avenue ou une Ruelle sur les 4 bordures géographiques."
      );
      return;
    }

    try {
      setLoading(true);

      const voies = {
        voieHautType: h,
        voieHautLargeur: Number(lHaut) || 0,

        voieBasType: b,
        voieBasLargeur: Number(lBas) || 0,

        voieGaucheType: g,
        voieGaucheLargeur: Number(lGauche) || 0,

        voieDroiteType: d,
        voieDroiteLargeur: Number(lDroite) || 0,
      };

      if (editing && bloc) {
        await updateBloc(bloc.id, {
          reference: reference.trim(),
          superficie: Number(superficie),
          sectionId: Number(sectionId),
          ...voies,
        });
      } else {
        await createBloc({
          reference: reference.trim(),
          superficie: Number(superficie),
          nombreParcelles: Number(nombreParcelles),
          sectionId: Number(sectionId),
          ...voies,
        });
      }

      onSuccess();
    } catch (err: any) {
      console.error("Erreur enregistrement bloc :", err);

      setError(
        err?.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {editing ? "Modifier le bloc" : "Nouveau bloc"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Section d'affectation *
            </label>

            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full rounded border bg-white p-2.5 text-sm outline-none"
            >
              <option value="">
                Sélectionner une section
              </option>

              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.reference} — {s.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Référence du bloc *
            </label>

            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full rounded border p-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Superficie (m²) *
            </label>

            <input
              type="number"
              step="0.01"
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              className="w-full rounded border p-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nombre de parcelles *
            </label>

            <input
              type="number"
              disabled={editing}
              value={nombreParcelles}
              onChange={(e) =>
                setNombreParcelles(e.target.value)
              }
              className="w-full rounded border p-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-4 text-base font-semibold text-slate-900">
            Quadrillage et voies d'accès obligatoires
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderVoie(
              "Bordure Supérieure (Haut)",
              vHaut,
              setVHaut,
              lHaut,
              setLHaut
            )}

            {renderVoie(
              "Bordure Inférieure (Bas)",
              vBas,
              setVBas,
              lBas,
              setLBas
            )}

            {renderVoie(
              "Bordure Gauche",
              vGauche,
              setVGauche,
              lGauche,
              setLGauche
            )}

            {renderVoie(
              "Bordure Droite",
              vDroite,
              setVDroite,
              lDroite,
              setLDroite
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2 text-sm font-medium text-slate-700"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Valider"}
          </button>
        </div>
      </form>
    </div>
  );
}
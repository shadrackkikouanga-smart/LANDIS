"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  getTerrain,
  updateTerrain,
} from "@/services/terrains";

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
  localisation?: string;
  statut: string;
  projectId: number;
}

export default function TerrainEditPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [terrain, setTerrain] = useState<Terrain | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reference, setReference] = useState("");
  const [nom, setNom] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [statut, setStatut] =
    useState("EN_PREPARATION");

  useEffect(() => {
    async function loadTerrain() {
      try {
        setLoading(true);
        setError("");

        const data = await getTerrain(id);

        setTerrain(data);

        setReference(data.reference ?? "");
        setNom(data.nom ?? "");
        setSuperficie(
          String(data.superficie ?? ""),
        );
        setLocalisation(
          data.localisation ?? "",
        );
        setStatut(
          data.statut ?? "EN_PREPARATION",
        );
      } catch (error) {
        console.error(
          "Erreur chargement terrain :",
          error,
        );

        setError(
          "Impossible de charger le terrain.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTerrain();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!reference.trim()) {
      setError(
        "La référence du terrain est obligatoire.",
      );
      return;
    }

    if (!nom.trim()) {
      setError(
        "Le nom du terrain est obligatoire.",
      );
      return;
    }

    if (
      !superficie ||
      Number(superficie) <= 0
    ) {
      setError(
        "La superficie doit être supérieure à 0.",
      );
      return;
    }

    try {
      setSaving(true);

      await updateTerrain(id, {
        reference: reference.trim(),
        nom: nom.trim(),
        superficie: Number(superficie),
        localisation:
          localisation.trim() || undefined,
        statut,
      });

      setSuccess(
        "Le terrain a été modifié avec succès.",
      );

      setTimeout(() => {
        router.push(`/terrains/${id}`);
      }, 700);
    } catch (error) {
      console.error(
        "Erreur modification terrain :",
        error,
      );

      setError(
        "Impossible de modifier le terrain. Vérifiez les informations saisies.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (!terrain) {
    return (
      <div className="space-y-6">
        <Link
          href="/terrains"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            hover:text-slate-900
          "
        >
          <ArrowLeft size={17} />

          Retour aux terrains
        </Link>

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-10
            text-center
          "
        >
          <p className="text-lg font-semibold text-slate-900">
            Terrain introuvable.
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* RETOUR */}

      <Link
        href={`/terrains/${id}`}
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-slate-600
          hover:text-slate-900
        "
      >
        <ArrowLeft size={17} />

        Retour au terrain
      </Link>


      {/* EN-TÊTE */}

      <div>
        <h1
          className="
            text-3xl
            font-bold
            text-slate-900
          "
        >
          Modifier le terrain
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Modifiez les informations du terrain{" "}
          <span className="font-medium">
            {terrain.reference}
          </span>
          .
        </p>
      </div>


      {/* FORMULAIRE */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <form onSubmit={handleSubmit}>

          <div className="space-y-6 p-6">

            {/* ERREUR */}

            {error && (
              <div
                className="
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}


            {/* SUCCÈS */}

            {success && (
              <div
                className="
                  rounded-lg
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-sm
                  text-green-700
                "
              >
                {success}
              </div>
            )}


            {/* RÉFÉRENCE + NOM */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              "
            >

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Référence *
                </label>

                <input
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. TERR-001"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

              </div>


              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Nom du terrain *
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(event) =>
                    setNom(event.target.value)
                  }
                  placeholder="Ex. Terrain Pointe-Noire"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

              </div>

            </div>


            {/* SUPERFICIE + LOCALISATION */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              "
            >

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Superficie (m²) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={superficie}
                  onChange={(event) =>
                    setSuperficie(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 50000"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

              </div>


              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Localisation
                </label>

                <input
                  type="text"
                  value={localisation}
                  onChange={(event) =>
                    setLocalisation(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Pointe-Noire"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

              </div>

            </div>


            {/* STATUT */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Statut
              </label>

              <select
                value={statut}
                onChange={(event) =>
                  setStatut(
                    event.target.value,
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
              >

                <option value="EN_PREPARATION">
                  En préparation
                </option>

                <option value="EN_COURS">
                  En cours
                </option>

                <option value="SUSPENDU">
                  Suspendu
                </option>

                <option value="TERMINE">
                  Terminé
                </option>

              </select>

            </div>

          </div>


          {/* FOOTER */}

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-slate-200
              px-6
              py-4
            "
          >

            <Link
              href={`/terrains/${id}`}
              className="
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
              "
            >
              Annuler
            </Link>


            <button
              type="submit"
              disabled={saving}
              className="
                rounded-lg
                bg-slate-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
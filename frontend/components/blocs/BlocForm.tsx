"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createBloc,
  updateBloc,
  Bloc,
  Terrain,
} from "@/services/blocs";

interface BlocFormProps {
  terrains: Terrain[];
  bloc?: Bloc;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BlocForm({
  terrains,
  bloc,
  onSuccess,
  onCancel,
}: BlocFormProps) {
  const editing = Boolean(bloc);

  const [reference, setReference] =
    useState("");

  const [superficie, setSuperficie] =
    useState("");

  const [nombreParcelles, setNombreParcelles] =
    useState("");

  const [terrainId, setTerrainId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (bloc) {
      setReference(
        bloc.reference ?? "",
      );

      setSuperficie(
        String(bloc.superficie ?? ""),
      );

      setNombreParcelles(
        String(
          bloc.nombreParcelles ?? "",
        ),
      );

      setTerrainId(
        String(bloc.terrainId ?? ""),
      );
    }
  }, [bloc]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!reference.trim()) {
      setError(
        "La référence du bloc est obligatoire.",
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

    if (!terrainId) {
      setError(
        "Veuillez sélectionner un terrain.",
      );
      return;
    }

    if (!editing) {
      if (
        !nombreParcelles ||
        Number(nombreParcelles) <= 0
      ) {
        setError(
          "Le nombre de parcelles doit être supérieur à 0.",
        );
        return;
      }

      if (
        !Number.isInteger(
          Number(nombreParcelles),
        )
      ) {
        setError(
          "Le nombre de parcelles doit être un nombre entier.",
        );
        return;
      }
    }

    try {
      setLoading(true);

      if (editing && bloc) {
        await updateBloc(bloc.id, {
          reference:
            reference.trim(),

          superficie:
            Number(superficie),

          terrainId:
            Number(terrainId),
        });
      } else {
        await createBloc({
          reference:
            reference.trim(),

          superficie:
            Number(superficie),

          nombreParcelles:
            Number(nombreParcelles),

          terrainId:
            Number(terrainId),
        });
      }

      onSuccess();
    } catch (error) {
      console.error(
        "Erreur formulaire bloc :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : editing
            ? "Impossible de modifier le bloc."
            : "Impossible de créer le bloc.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          border-b
          border-slate-200
          px-6
          py-5
        "
      >
        <h2
          className="
            text-xl
            font-bold
            text-slate-900
          "
        >
          {editing
            ? "Modifier le bloc"
            : "Nouveau bloc"}
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          {editing
            ? "Modifiez les informations du bloc."
            : "Créez un bloc et générez automatiquement ses parcelles."}
        </p>
      </div>


      {/* FORMULAIRE */}

      <form onSubmit={handleSubmit}>

        <div className="space-y-6 px-6 py-6">

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


          {/* TERRAIN */}

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
              Terrain *
            </label>

            <select
              value={terrainId}
              onChange={(event) =>
                setTerrainId(
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
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            >
              <option value="">
                Sélectionner un terrain
              </option>

              {terrains.map(
                (terrain) => (
                  <option
                    key={terrain.id}
                    value={terrain.id}
                  >
                    {terrain.reference} —{" "}
                    {terrain.nom}
                  </option>
                ),
              )}
            </select>
          </div>


          {/* RÉFÉRENCE */}

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
              Référence du bloc *
            </label>

            <input
              type="text"
              value={reference}
              onChange={(event) =>
                setReference(
                  event.target.value,
                )
              }
              placeholder="Ex. BLOC-A"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-3
                py-2.5
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />
          </div>


          {/* SUPERFICIE + PARCELLES */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
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
                Superficie du bloc (m²) *
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
                placeholder="Ex. 10000"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  outline-none
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
                Nombre de parcelles *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={nombreParcelles}
                onChange={(event) =>
                  setNombreParcelles(
                    event.target.value,
                  )
                }
                disabled={editing}
                placeholder="Ex. 25"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  disabled:bg-slate-100
                  disabled:text-slate-500
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
              />

              {editing && (
                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  Pour modifier le nombre de
                  parcelles, utilisez les actions
                  disponibles sur la page du bloc.
                </p>
              )}
            </div>

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

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
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
              disabled:opacity-50
            "
          >
            Annuler
          </button>


          <button
            type="submit"
            disabled={loading}
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
            {loading
              ? "Enregistrement..."
              : editing
                ? "Enregistrer les modifications"
                : "Créer le bloc"}
          </button>

        </div>

      </form>

    </div>
  );
}
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  updateParcelle,
  Parcelle,
} from "@/services/parcelles";

import { getBlocs } from "@/services/blocs";

interface Bloc {
  id: number;
  reference: string;
  superficie: number;
  nombreParcelles: number;
}

interface ParcelleEditFormProps {
  parcelle: Parcelle;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ParcelleEditForm({
  parcelle,
  onSuccess,
  onCancel,
}: ParcelleEditFormProps) {
  const [reference, setReference] =
    useState(parcelle.reference);

  const [numero, setNumero] =
    useState(parcelle.numero);

  const [superficie, setSuperficie] =
    useState(
      String(parcelle.superficie),
    );

  const [blocId, setBlocId] =
    useState(String(parcelle.blocId));

  const [latitude, setLatitude] =
    useState(
      parcelle.latitude !== null &&
      parcelle.latitude !== undefined
        ? String(parcelle.latitude)
        : "",
    );

  const [longitude, setLongitude] =
    useState(
      parcelle.longitude !== null &&
      parcelle.longitude !== undefined
        ? String(parcelle.longitude)
        : "",
    );

  const [blocs, setBlocs] =
    useState<Bloc[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingBlocs, setLoadingBlocs] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBlocs() {
      try {
        const data = await getBlocs();

        setBlocs(data);
      } catch (error) {
        console.error(
          "Erreur chargement blocs :",
          error,
        );

        setError(
          "Impossible de charger les blocs.",
        );
      } finally {
        setLoadingBlocs(false);
      }
    }

    loadBlocs();
  }, []);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!reference.trim()) {
      setError(
        "La référence est obligatoire.",
      );
      return;
    }

    if (!numero.trim()) {
      setError(
        "Le numéro est obligatoire.",
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

    if (!blocId) {
      setError(
        "Veuillez sélectionner un bloc.",
      );
      return;
    }

    if (
      latitude &&
      (Number(latitude) < -90 ||
        Number(latitude) > 90)
    ) {
      setError(
        "La latitude doit être comprise entre -90 et 90.",
      );
      return;
    }

    if (
      longitude &&
      (Number(longitude) < -180 ||
        Number(longitude) > 180)
    ) {
      setError(
        "La longitude doit être comprise entre -180 et 180.",
      );
      return;
    }

    try {
      setLoading(true);

      await updateParcelle(
        parcelle.id,
        {
          reference:
            reference.trim(),

          numero:
            numero.trim(),

          superficie:
            Number(superficie),

          blocId:
            Number(blocId),

          latitude:
            latitude.trim() !== ""
              ? Number(latitude)
              : null,

          longitude:
            longitude.trim() !== ""
              ? Number(longitude)
              : null,
        },
      );

      onSuccess();
    } catch (error) {
      console.error(
        "Erreur modification parcelle :",
        error,
      );

      setError(
        "Impossible de modifier la parcelle.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-xl
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-bold
                text-slate-900
              "
            >
              Modifier la parcelle
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Modifiez les informations de
              la parcelle.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-lg
              p-2
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div
            className="
              space-y-5
              px-6
              py-6
            "
          >
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
                  Numéro *
                </label>

                <input
                  type="text"
                  value={numero}
                  onChange={(event) =>
                    setNumero(
                      event.target.value,
                    )
                  }
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
                Bloc *
              </label>

              <select
                value={blocId}
                onChange={(event) =>
                  setBlocId(
                    event.target.value,
                  )
                }
                disabled={loadingBlocs}
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
                  Sélectionner un bloc
                </option>

                {blocs.map((bloc) => (
                  <option
                    key={bloc.id}
                    value={bloc.id}
                  >
                    {bloc.reference}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="
                border-t
                border-slate-200
                pt-5
              "
            >
              <div className="mb-4">
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Localisation
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Les coordonnées servent
                  à positionner la parcelle
                  sur la carte.
                </p>
              </div>

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
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={latitude}
                    onChange={(event) =>
                      setLatitude(
                        event.target.value,
                      )
                    }
                    placeholder="Ex. -4.2634"
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
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(event) =>
                      setLongitude(
                        event.target.value,
                      )
                    }
                    placeholder="Ex. 15.2429"
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
              </div>
            </div>
          </div>

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
                disabled:opacity-50
              "
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

import { updateProject } from "@/services/projects";

interface Project {
  id: number;
  name: string;
  reference: string;
  description?: string;
  location?: string;
  area: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface ProjectEditFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectEditForm({
  project,
  onSuccess,
  onCancel,
}: ProjectEditFormProps) {
  const [name, setName] = useState(project.name);
  const [reference, setReference] = useState(
    project.reference,
  );
  const [description, setDescription] = useState(
    project.description ?? "",
  );
  const [location, setLocation] = useState(
    project.location ?? "",
  );
  const [area, setArea] = useState(
    String(project.area),
  );
  const [status, setStatus] = useState(
    project.status,
  );

  const [startDate, setStartDate] = useState(
    project.startDate
      ? project.startDate.substring(0, 10)
      : "",
  );

  const [endDate, setEndDate] = useState(
    project.endDate
      ? project.endDate.substring(0, 10)
      : "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Le nom du projet est obligatoire.",
      );
      return;
    }

    if (!reference.trim()) {
      setError(
        "La référence du projet est obligatoire.",
      );
      return;
    }

    if (!area || Number(area) <= 0) {
      setError(
        "La superficie doit être supérieure à 0.",
      );
      return;
    }

    try {
      setLoading(true);

      await updateProject(project.id, {
        name: name.trim(),
        reference: reference.trim(),
        description:
          description.trim() || undefined,
        location:
          location.trim() || undefined,
        area: Number(area),
        status,
        startDate:
          startDate || undefined,
        endDate:
          endDate || undefined,
      });

      onSuccess();
    } catch (error) {
      console.error(
        "Erreur modification projet :",
        error,
      );

      setError(
        "Impossible de modifier le projet. Vérifiez les informations saisies.",
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
          max-w-3xl
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-xl
        "
      >

        {/* Header */}

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
              Modifier le projet
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Modifiez les informations du
              projet de lotissement.
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

        {/* Formulaire */}

        <form onSubmit={handleSubmit}>

          <div className="space-y-5 px-6 py-6">

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

            {/* Nom + référence */}

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
                  Nom du projet *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
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

            </div>

            {/* Localisation + superficie */}

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
                  Localisation
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
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
                  Superficie totale (m²) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={area}
                  onChange={(event) =>
                    setArea(
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

            {/* Statut */}

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
                value={status}
                onChange={(event) =>
                  setStatus(
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

            {/* Dates */}

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
                  Date de début
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
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
                  Date de fin
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(
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

            {/* Description */}

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
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={4}
                className="
                  w-full
                  resize-none
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

          {/* Footer */}

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
                : "Enregistrer les modifications"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
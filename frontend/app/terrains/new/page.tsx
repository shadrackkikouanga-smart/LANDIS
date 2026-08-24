"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  LandPlot,
} from "lucide-react";
import Link from "next/link";

import { createTerrain } from "@/services/terrains";
import { getProjects } from "@/services/projects";

interface Project {
  id: number;
  name: string;
  reference: string;
}

export default function NewTerrainPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [reference, setReference] = useState("");
  const [nom, setNom] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [statut, setStatut] = useState("EN_PREPARATION");
  const [projectId, setProjectId] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);

        const data = await getProjects();

        setProjects(data);
      } catch (error) {
        console.error(
          "Erreur chargement projets :",
          error,
        );

        setError(
          "Impossible de charger les projets.",
        );
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, []);

  async function handleSubmit(
    event: FormEvent,
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

    if (!projectId) {
      setError(
        "Veuillez sélectionner un projet.",
      );
      return;
    }

    try {
      setLoading(true);

      await createTerrain({
        reference: reference.trim(),
        nom: nom.trim(),
        superficie: Number(superficie),
        localisation:
          localisation.trim() || undefined,
        statut,
        projectId: Number(projectId),
      });

      setSuccess(
        "Le terrain a été créé avec succès.",
      );

      setReference("");
      setNom("");
      setSuperficie("");
      setLocalisation("");
      setStatut("EN_PREPARATION");
      setProjectId("");
    } catch (error) {
      console.error(
        "Erreur création terrain :",
        error,
      );

      setError(
        "Impossible de créer le terrain. Vérifiez les informations saisies.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* RETOUR */}

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


      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">

        <div
          className="
            rounded-xl
            bg-slate-900
            p-3
            text-white
          "
        >
          <LandPlot size={26} />
        </div>

        <div>

          <h1
            className="
              text-3xl
              font-bold
              text-slate-900
            "
          >
            Nouveau terrain
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Enregistrez un nouveau terrain
            dans un projet de lotissement.
          </p>

        </div>

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


            {/* PROJET */}

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
                Projet *
              </label>

              <select
                value={projectId}
                onChange={(event) =>
                  setProjectId(
                    event.target.value,
                  )
                }
                disabled={loadingProjects}
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
                  disabled:bg-slate-100
                "
              >

                <option value="">
                  {loadingProjects
                    ? "Chargement des projets..."
                    : "Sélectionner un projet"}
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name} —{" "}
                    {project.reference}
                  </option>
                ))}

              </select>

              {!loadingProjects &&
                projects.length === 0 && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-amber-600
                    "
                  >
                    Aucun projet disponible.
                    Créez d'abord un projet.
                  </p>
                )}

            </div>


            {/* NOM + RÉFÉRENCE */}

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
                    setNom(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Terrain Nord"
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


            {/* SUPERFICIE + LOCALISATION */}

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
                  Superficie totale (m²) *
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
              href="/terrains"
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
              disabled={
                loading ||
                loadingProjects ||
                projects.length === 0
              }
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
                ? "Création..."
                : "Créer le terrain"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
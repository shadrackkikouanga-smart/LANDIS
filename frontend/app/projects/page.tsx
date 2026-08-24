"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FolderKanban,
  MapPin,
  Ruler,
  Plus,
  RefreshCw,
  Eye,
} from "lucide-react";

import { getProjects } from "@/services/projects";
import ProjectForm from "@/components/projects/ProjectForm";

interface Project {
  id: number;
  name: string;
  reference: string;
  description?: string;
  location?: string;
  area: number;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleProjectCreated() {
    setShowForm(false);
    loadProjects();
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "EN_PREPARATION":
        return "En préparation";

      case "EN_COURS":
        return "En cours";

      case "SUSPENDU":
        return "Suspendu";

      case "TERMINE":
        return "Terminé";

      default:
        return status;
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "EN_PREPARATION":
        return "bg-amber-50 text-amber-700";

      case "EN_COURS":
        return "bg-blue-50 text-blue-700";

      case "SUSPENDU":
        return "bg-red-50 text-red-700";

      case "TERMINE":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <div className="space-y-8">

      {/* En-tête */}

      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <div className="flex items-center gap-3">

            <div
              className="
                rounded-xl
                bg-slate-900
                p-3
                text-white
              "
            >
              <FolderKanban size={24} />
            </div>

            <div>

              <h1
                className="
                  text-3xl
                  font-bold
                  text-slate-900
                "
              >
                Projets
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Gestion des projets de lotissement
              </p>

            </div>

          </div>

        </div>


        {/* Boutons */}

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
            "
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              shadow-sm
              hover:bg-slate-800
            "
          >

            <Plus size={18} />

            Nouveau projet

          </button>

        </div>

      </div>


      {/* Erreur */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}


      {/* Statistique rapide */}

      {!loading && (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-4
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p className="text-sm text-slate-500">
                Nombre total de projets
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {projects.length}
              </p>

            </div>

            <FolderKanban
              size={28}
              className="text-slate-400"
            />

          </div>

        </div>
      )}


      {/* Chargement */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {[1, 2, 3].map((item) => (

            <div
              key={item}
              className="
                h-64
                animate-pulse
                rounded-xl
                border
                border-slate-200
                bg-white
              "
            />

          ))}

        </div>
      )}


      {/* Aucun projet */}

      {!loading && projects.length === 0 && (

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-16
            text-center
          "
        >

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-slate-100
            "
          >

            <FolderKanban
              size={26}
              className="text-slate-500"
            />

          </div>


          <h2
            className="
              mt-5
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Aucun projet
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Commencez par créer votre premier projet de
            lotissement.
          </p>


          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-slate-800
            "
          >

            <Plus size={18} />

            Créer un projet

          </button>

        </div>

      )}


      {/* Liste des projets */}

      {!loading && projects.length > 0 && (

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {projects.map((project) => (

            <div
              key={project.id}
              className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
              "
            >

              {/* Bandeau */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  px-5
                  py-4
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      rounded-lg
                      bg-slate-100
                      p-2.5
                    "
                  >

                    <FolderKanban
                      size={20}
                      className="text-slate-700"
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Référence
                    </p>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >
                      {project.reference}
                    </p>

                  </div>

                </div>


                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${getStatusStyle(
                      project.status,
                    )}
                  `}
                >
                  {getStatusLabel(
                    project.status,
                  )}
                </span>

              </div>


              {/* Contenu */}

              <div className="p-5">

                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  {project.name}
                </h2>


                <p
                  className="
                    mt-2
                    min-h-[48px]
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {project.description ||
                    "Aucune description renseignée."}
                </p>


                <div className="mt-5 space-y-3">

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-slate-600
                    "
                  >

                    <MapPin
                      size={17}
                      className="text-slate-400"
                    />

                    <span>
                      {project.location ||
                        "Localisation non renseignée"}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      text-sm
                      text-slate-600
                    "
                  >

                    <Ruler
                      size={17}
                      className="text-slate-400"
                    />

                    <span>
                      {project.area.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      m²
                    </span>

                  </div>

                </div>

              </div>


              {/* Actions */}

              <div
                className="
                  border-t
                  border-slate-100
                  bg-slate-50
                  px-5
                  py-4
                "
              >

                <Link
                  href={`/projects/${project.id}`}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-100
                  "
                >

                  <Eye size={16} />

                  Voir le projet

                </Link>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* Formulaire */}

      {showForm && (

        <ProjectForm
          onSuccess={handleProjectCreated}
          onCancel={() => setShowForm(false)}
        />

      )}

    </div>
  );
}
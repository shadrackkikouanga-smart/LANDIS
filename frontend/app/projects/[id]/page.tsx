"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  FolderKanban,
  MapPin,
  Ruler,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  getProject,
  deleteProject,
} from "@/services/projects";

import ProjectEditForm from "@/components/projects/ProjectEditForm";

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

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showEditForm, setShowEditForm] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const data = await getProject(id);

      setProject(data);
    } catch (error) {
      console.error(
        "Erreur chargement projet :",
        error,
      );

      setError(
        "Impossible de charger les informations du projet.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

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

  async function handleDelete() {
    if (!project) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le projet "${project.name}" ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteProject(project.id);

      router.push("/projects");
      router.refresh();
    } catch (error) {
      console.error(
        "Erreur suppression projet :",
        error,
      );

      setError(
        "Impossible de supprimer le projet.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleEditSuccess() {
    setShowEditForm(false);
    loadProject();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="space-y-6">
        <Link
          href="/projects"
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

          Retour aux projets
        </Link>

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
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Link
          href="/projects"
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

          Retour aux projets
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
          Projet introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* RETOUR */}

      <Link
        href="/projects"
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

        Retour aux projets
      </Link>


      {/* ERREUR */}

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


      {/* EN-TÊTE */}

      <div
        className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              rounded-xl
              bg-slate-900
              p-3
              text-white
            "
          >
            <FolderKanban size={26} />
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h1
                className="
                  text-3xl
                  font-bold
                  text-slate-900
                "
              >
                {project.name}
              </h1>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${getStatusStyle(project.status)}
                `}
              >
                {getStatusLabel(project.status)}
              </span>

            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Référence : {project.reference}
            </p>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() => setShowEditForm(true)}
            className="
              inline-flex
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
            "
          >
            <Pencil size={17} />

            Modifier
          </button>


          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-red-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-red-600
              hover:bg-red-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2 size={17} />

            {deleting
              ? "Suppression..."
              : "Supprimer"}
          </button>

        </div>

      </div>


      {/* INFORMATIONS */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
        "
      >

        {/* DESCRIPTION */}

        <div
          className="
            lg:col-span-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Informations générales
          </h2>

          <p
            className="
              mt-4
              text-sm
              leading-7
              text-slate-600
            "
          >
            {project.description ||
              "Aucune description renseignée."}
          </p>

        </div>


        {/* RÉSUMÉ */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Résumé
          </h2>

          <div className="mt-5 space-y-5">

            <div className="flex items-center gap-3">

              <MapPin
                size={20}
                className="text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Localisation
                </p>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {project.location ||
                    "Non renseignée"}
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <Ruler
                size={20}
                className="text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Superficie
                </p>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {project.area.toLocaleString(
                    "fr-FR",
                  )}{" "}
                  m²
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <CalendarDays
                size={20}
                className="text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Date de début
                </p>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {project.startDate
                    ? new Date(
                        project.startDate,
                      ).toLocaleDateString(
                        "fr-FR",
                      )
                    : "Non renseignée"}
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <CalendarDays
                size={20}
                className="text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Date de fin
                </p>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {project.endDate
                    ? new Date(
                        project.endDate,
                      ).toLocaleDateString(
                        "fr-FR",
                      )
                    : "Non renseignée"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* GESTION DU LOTISSEMENT */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <h2
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Gestion du lotissement
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Les éléments liés à ce projet seront
          accessibles ici.
        </p>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >

          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-5
            "
          >
            <p className="text-sm font-semibold text-slate-800">
              Terrains
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Gérer les terrains du projet
            </p>
          </div>


          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-5
            "
          >
            <p className="text-sm font-semibold text-slate-800">
              Blocs
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Gérer les blocs du lotissement
            </p>
          </div>


          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-5
            "
          >
            <p className="text-sm font-semibold text-slate-800">
              Parcelles
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Gérer les parcelles du projet
            </p>
          </div>

        </div>

      </div>


      {/* FORMULAIRE DE MODIFICATION */}

      {showEditForm && (
        <ProjectEditForm
          project={project}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditForm(false)}
        />
      )}

    </div>
  );
}
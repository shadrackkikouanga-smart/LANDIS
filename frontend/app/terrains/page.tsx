"use client";

import { useEffect, useState } from "react";
import {
  LandPlot,
  MapPin,
  Ruler,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { getTerrains, deleteTerrain } from "@/services/terrains";

interface Project {
  id: number;
  name: string;
  reference: string;
}

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
  localisation?: string;
  statut: string;
  projectId: number;
  project?: Project;
}

export default function TerrainsPage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTerrains() {
    try {
      setLoading(true);
      setError("");

      const data = await getTerrains();

      setTerrains(data);
    } catch (error) {
      console.error(
        "Erreur chargement terrains :",
        error,
      );

      setError(
        "Impossible de charger les terrains.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTerrains();
  }, []);

  async function handleDelete(
    terrain: Terrain,
  ) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le terrain "${terrain.nom}" ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTerrain(terrain.id);

      await loadTerrains();
    } catch (error) {
      console.error(
        "Erreur suppression terrain :",
        error,
      );

      setError(
        "Impossible de supprimer le terrain.",
      );
    }
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

      {/* EN-TÊTE */}

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

        <div className="flex items-center gap-3">

          <div
            className="
              rounded-xl
              bg-slate-900
              p-3
              text-white
            "
          >
            <LandPlot size={24} />
          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Terrains
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gestion des terrains de lotissement
            </p>

          </div>

        </div>


        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={loadTerrains}
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


          <Link
            href="/terrains/new"
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

            Nouveau terrain
          </Link>

        </div>

      </div>


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


      {/* STATISTIQUE */}

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

          <p className="text-sm text-slate-500">
            Nombre total de terrains
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-slate-900
            "
          >
            {terrains.length}
          </p>

        </div>
      )}


      {/* CHARGEMENT */}

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
                h-72
                animate-pulse
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            />
          ))}
        </div>
      )}


      {/* AUCUN TERRAIN */}

      {!loading &&
        terrains.length === 0 && (
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

            <LandPlot
              size={40}
              className="
                mx-auto
                text-slate-400
              "
            />

            <h2
              className="
                mt-5
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Aucun terrain
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Commencez par créer votre
              premier terrain.
            </p>

            <Link
              href="/terrains/new"
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

              Créer un terrain
            </Link>

          </div>
        )}


      {/* LISTE */}

      {!loading &&
        terrains.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            {terrains.map((terrain) => (
              <div
                key={terrain.id}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >

                {/* HEADER CARTE */}

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
                      <LandPlot
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
                        {terrain.reference}
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
                        terrain.statut,
                      )}
                    `}
                  >
                    {getStatusLabel(
                      terrain.statut,
                    )}
                  </span>

                </div>


                {/* CONTENU */}

                <div className="p-5">

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {terrain.nom}
                  </h2>


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

                      <Ruler
                        size={17}
                        className="text-slate-400"
                      />

                      <span>
                        {terrain.superficie.toLocaleString(
                          "fr-FR",
                        )}{" "}
                        m²
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

                      <MapPin
                        size={17}
                        className="text-slate-400"
                      />

                      <span>
                        {terrain.localisation ||
                          "Localisation non renseignée"}
                      </span>

                    </div>

                  </div>


                  {/* PROJET */}

                  <div
                    className="
                      mt-5
                      rounded-lg
                      bg-slate-50
                      px-4
                      py-3
                    "
                  >

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Projet
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      {terrain.project?.name ||
                        "Projet non renseigné"}
                    </p>

                  </div>

                </div>


                {/* ACTIONS */}

                <div
                  className="
                    flex
                    gap-2
                    border-t
                    border-slate-100
                    bg-slate-50
                    px-5
                    py-4
                  "
                >

                  <Link
                    href={`/terrains/${terrain.id}`}
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-100
                    "
                  >
                    <Eye size={16} />

                    Voir
                  </Link>


                  <Link
                    href={`/terrains/${terrain.id}/edit`}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-3
                      py-2.5
                      text-slate-700
                      hover:bg-slate-100
                    "
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </Link>


                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(terrain)
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-red-200
                      bg-white
                      px-3
                      py-2.5
                      text-red-600
                      hover:bg-red-50
                    "
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

    </div>
  );
}
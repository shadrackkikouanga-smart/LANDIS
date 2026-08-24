"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LandPlot,
  MapPin,
  Ruler,
  Layers3,
  Grid3X3,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  CircleDollarSign,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getTerrain } from "@/services/terrains";

interface Project {
  id: number;
  name: string;
  reference: string;
}

interface Parcelle {
  id: number;
  reference?: string;
  proprietaireId?: number | null;
}

interface Bloc {
  id: number;
  reference?: string;
  nom?: string;
  superficie: number;
  nombreParcelles: number;
  parcelles: Parcelle[];
}

interface TerrainStatistics {
  nombreBlocsDeclares: number;
  nombreBlocsReels: number;
  ecartBlocs: number;
  etatTerrain: string;

  nombreParcellesDeclarees: number;
  nombreParcellesReelles: number;
  ecartParcelles: number;

  parcellesDisponibles: number;
  parcellesAttribuees: number;

  surfaceTotaleTerrain: number;
  surfaceLotie: number;
  surfaceRestante: number;
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
  blocs: Bloc[];
  statistiques: TerrainStatistics;
}

export default function TerrainDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTerrain() {
      try {
        setLoading(true);
        setError("");

        const data = await getTerrain(id);

        setTerrain(data);
      } catch (error) {
        console.error(
          "Erreur chargement terrain :",
          error,
        );

        setError(
          "Impossible de charger les informations du terrain.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTerrain();
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

  function formatNumber(value: number) {
    return value.toLocaleString("fr-FR");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-40 animate-pulse rounded-2xl bg-white" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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
          Terrain introuvable.
        </div>
      </div>
    );
  }

  const stats = terrain.statistiques;

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

      <div
        className="
          flex
          flex-col
          gap-5
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
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
            <LandPlot size={28} />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1
                className="
                  text-3xl
                  font-bold
                  text-slate-900
                "
              >
                {terrain.nom}
              </h1>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${getStatusStyle(terrain.statut)}
                `}
              >
                {getStatusLabel(terrain.statut)}
              </span>

            </div>

            <p className="mt-1 text-sm text-slate-500">
              Référence : {terrain.reference}
            </p>

          </div>
        </div>


        {/* PROJET */}

        <div
          className="
            rounded-xl
            bg-slate-50
            px-5
            py-4
          "
        >
          <p className="text-xs text-slate-400">
            Projet
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {terrain.project?.name ||
              "Projet non renseigné"}
          </p>

          {terrain.project?.reference && (
            <p className="mt-1 text-xs text-slate-500">
              {terrain.project.reference}
            </p>
          )}
        </div>

      </div>


      {/* INFORMATIONS PRINCIPALES */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
        "
      >

        {/* LOCALISATION */}

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
          <div className="flex items-center gap-3">

            <MapPin
              size={22}
              className="text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">
                Localisation
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {terrain.localisation ||
                  "Non renseignée"}
              </p>
            </div>

          </div>
        </div>


        {/* SUPERFICIE */}

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
          <div className="flex items-center gap-3">

            <Ruler
              size={22}
              className="text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">
                Superficie totale
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatNumber(terrain.superficie)} m²
              </p>
            </div>

          </div>
        </div>


        {/* ÉTAT */}

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
          <div className="flex items-center gap-3">

            {stats.etatTerrain === "COMPLET" ? (
              <CheckCircle2
                size={22}
                className="text-green-500"
              />
            ) : (
              <AlertTriangle
                size={22}
                className="text-amber-500"
              />
            )}

            <div>
              <p className="text-xs text-slate-400">
                État du terrain
              </p>

              <p
                className={`
                  mt-1
                  text-sm
                  font-semibold
                  ${
                    stats.etatTerrain === "COMPLET"
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                `}
              >
                {stats.etatTerrain}
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* STATISTIQUES BLOCS */}

      <div>

        <div className="mb-4 flex items-center gap-3">

          <Layers3
            size={22}
            className="text-slate-700"
          />

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Statistiques des blocs
            </h2>

            <p className="text-sm text-slate-500">
              Comparaison entre les blocs déclarés et les blocs réellement créés.
            </p>
          </div>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-3
          "
        >

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
            <p className="text-sm text-slate-500">
              Blocs déclarés
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.nombreBlocsDeclares}
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Blocs réels
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.nombreBlocsReels}
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Écart
            </p>

            <p
              className={`
                mt-2
                text-3xl
                font-bold
                ${
                  stats.ecartBlocs === 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              `}
            >
              {stats.ecartBlocs}
            </p>
          </div>

        </div>

      </div>


      {/* STATISTIQUES PARCELLES */}

      <div>

        <div className="mb-4 flex items-center gap-3">

          <Grid3X3
            size={22}
            className="text-slate-700"
          />

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Statistiques des parcelles
            </h2>

            <p className="text-sm text-slate-500">
              État des parcelles prévues et réellement créées.
            </p>
          </div>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
          "
        >

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
            <p className="text-sm text-slate-500">
              Parcelles déclarées
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.nombreParcellesDeclarees}
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Parcelles réelles
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.nombreParcellesReelles}
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Disponibles
            </p>

            <div className="mt-2 flex items-center gap-2">

              <CircleDollarSign
                size={20}
                className="text-blue-500"
              />

              <p className="text-3xl font-bold text-blue-600">
                {stats.parcellesDisponibles}
              </p>

            </div>

          </div>


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
            <p className="text-sm text-slate-500">
              Attribuées
            </p>

            <div className="mt-2 flex items-center gap-2">

              <UserCheck
                size={20}
                className="text-green-500"
              />

              <p className="text-3xl font-bold text-green-600">
                {stats.parcellesAttribuees}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* SURFACES */}

      <div>

        <div className="mb-4">

          <h2 className="text-xl font-bold text-slate-900">
            Répartition des surfaces
          </h2>

          <p className="text-sm text-slate-500">
            Suivi de la superficie du terrain et de son lotissement.
          </p>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-3
          "
        >

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
            <p className="text-sm text-slate-500">
              Surface totale
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(
                stats.surfaceTotaleTerrain,
              )}{" "}
              m²
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Surface lotie
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatNumber(
                stats.surfaceLotie,
              )}{" "}
              m²
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Surface restante
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatNumber(
                stats.surfaceRestante,
              )}{" "}
              m²
            </p>
          </div>

        </div>

      </div>


      {/* BLOCS */}

      <div>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Blocs du terrain
            </h2>

            <p className="text-sm text-slate-500">
              Les blocs actuellement associés à ce terrain.
            </p>

          </div>

          <span
            className="
              rounded-full
              bg-slate-100
              px-3
              py-1
              text-sm
              font-medium
              text-slate-700
            "
          >
            {terrain.blocs.length} bloc
            {terrain.blocs.length > 1 ? "s" : ""}
          </span>

        </div>


        {terrain.blocs.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-10
              text-center
            "
          >
            <Layers3
              size={36}
              className="mx-auto text-slate-400"
            />

            <p className="mt-4 text-sm font-medium text-slate-700">
              Aucun bloc n'est encore associé à ce terrain.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Les blocs créés pour ce terrain apparaîtront ici.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            {terrain.blocs.map((bloc) => (
              <div
                key={bloc.id}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                "
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-xs text-slate-400">
                      Bloc
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {bloc.nom ||
                        bloc.reference ||
                        `Bloc #${bloc.id}`}
                    </h3>

                  </div>

                  <Layers3
                    size={22}
                    className="text-slate-400"
                  />

                </div>


                <div className="mt-5 space-y-3">

                  <div>
                    <p className="text-xs text-slate-400">
                      Superficie
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {formatNumber(
                        bloc.superficie,
                      )}{" "}
                      m²
                    </p>
                  </div>


                  <div>
                    <p className="text-xs text-slate-400">
                      Parcelles déclarées
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {bloc.nombreParcelles}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs text-slate-400">
                      Parcelles réelles
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {bloc.parcelles.length}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
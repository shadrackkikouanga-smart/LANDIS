"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  UserRound,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  LandPlot,
} from "lucide-react";

import {
  getProprietaires,
  deleteProprietaire,
  Proprietaire,
} from "@/services/proprietaires";

export default function ProprietairesPage() {
  const [proprietaires, setProprietaires] =
    useState<Proprietaire[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadProprietaires() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProprietaires();

      setProprietaires(data);
    } catch (error) {
      console.error(
        "Erreur chargement propriétaires :",
        error,
      );

      setError(
        "Impossible de charger les propriétaires.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProprietaires();
  }, []);

  async function handleDelete(
    proprietaire: Proprietaire,
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer le propriétaire "${proprietaire.nom} ${proprietaire.prenom}" ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProprietaire(
        proprietaire.id,
      );

      await loadProprietaires();
    } catch (error) {
      console.error(
        "Erreur suppression propriétaire :",
        error,
      );

      setError(
        "Impossible de supprimer ce propriétaire. Il peut éventuellement être lié à des données existantes.",
      );
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
            <UserRound size={24} />
          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Propriétaires
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gestion des propriétaires de parcelles
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={loadProprietaires}
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
            href="/proprietaires/new"
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

            Nouveau propriétaire
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


      {/* STATISTIQUES */}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

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
              Nombre total de propriétaires
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {proprietaires.length}
            </p>

          </div>

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
              Parcelles attribuées
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {proprietaires.reduce(
                (total, proprietaire) =>
                  total +
                  (proprietaire.parcelles?.length ?? 0),
                0,
              )}
            </p>

          </div>

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
                h-80
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


      {/* AUCUN PROPRIÉTAIRE */}

      {!loading &&
        proprietaires.length === 0 && (
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

            <UserRound
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
              Aucun propriétaire
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Commencez par enregistrer votre
              premier propriétaire.
            </p>

            <Link
              href="/proprietaires/new"
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

              Créer un propriétaire
            </Link>

          </div>
        )}


      {/* LISTE */}

      {!loading &&
        proprietaires.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            {proprietaires.map(
              (proprietaire) => (
                <div
                  key={proprietaire.id}
                  className="
                    overflow-hidden
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
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-100
                          text-slate-700
                        "
                      >
                        <UserRound size={21} />
                      </div>

                      <div>

                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          Propriétaire
                        </p>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          #{proprietaire.id}
                        </p>

                      </div>

                    </div>

                    <div
                      className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      {proprietaire.parcelles?.length ?? 0}{" "}
                      parcelle
                      {(proprietaire.parcelles?.length ?? 0) > 1
                        ? "s"
                        : ""}
                    </div>

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
                      {proprietaire.nom}{" "}
                      {proprietaire.prenom}
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

                        <Phone
                          size={17}
                          className="text-slate-400"
                        />

                        <span>
                          {proprietaire.telephone}
                        </span>

                      </div>


                      {proprietaire.email && (
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            text-sm
                            text-slate-600
                          "
                        >

                          <Mail
                            size={17}
                            className="text-slate-400"
                          />

                          <span className="truncate">
                            {proprietaire.email}
                          </span>

                        </div>
                      )}


                      {proprietaire.adresse && (
                        <div
                          className="
                            flex
                            items-start
                            gap-3
                            text-sm
                            text-slate-600
                          "
                        >

                          <MapPin
                            size={17}
                            className="
                              mt-0.5
                              shrink-0
                              text-slate-400
                            "
                          />

                          <span>
                            {proprietaire.adresse}
                          </span>

                        </div>
                      )}

                    </div>


                    {/* PARCELLES */}

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
                        Parcelles attribuées
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">

                        {proprietaire.parcelles &&
                        proprietaire.parcelles.length > 0 ? (
                          proprietaire.parcelles
                            .slice(0, 4)
                            .map((parcelle) => (
                              <span
                                key={parcelle.id}
                                className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-md
                                  bg-white
                                  px-2
                                  py-1
                                  text-xs
                                  font-medium
                                  text-slate-700
                                  ring-1
                                  ring-slate-200
                                "
                              >
                                <LandPlot size={13} />

                                {parcelle.reference}
                              </span>
                            ))
                        ) : (
                          <span
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Aucune parcelle attribuée
                          </span>
                        )}

                        {proprietaire.parcelles &&
                          proprietaire.parcelles.length > 4 && (
                            <span
                              className="
                                rounded-md
                                bg-slate-200
                                px-2
                                py-1
                                text-xs
                                font-medium
                                text-slate-600
                              "
                            >
                              +
                              {proprietaire.parcelles.length -
                                4}
                            </span>
                          )}

                      </div>

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
                      href={`/proprietaires/${proprietaire.id}`}
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
                      href={`/proprietaires/${proprietaire.id}/edit`}
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
                        handleDelete(
                          proprietaire,
                        )
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
              ),
            )}

          </div>
        )}

    </div>
  );
}
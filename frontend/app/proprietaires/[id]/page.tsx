"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Pencil,
  UserRound,
  Phone,
  Mail,
  MapPin,
  LandPlot,
  Loader2,
} from "lucide-react";

import {
  getProprietaire,
  Proprietaire,
} from "@/services/proprietaires";

export default function ProprietaireDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const [proprietaire, setProprietaire] =
    useState<Proprietaire | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProprietaire(id);

        setProprietaire(data);
      } catch (error) {
        console.error(
          "Erreur chargement propriétaire :",
          error,
        );

        setError(
          "Impossible de charger ce propriétaire.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          items-center
          justify-center
        "
      >
        <Loader2
          size={32}
          className="animate-spin text-slate-500"
        />
      </div>
    );
  }

  if (error || !proprietaire) {
    return (
      <div className="space-y-6">

        <Link
          href="/proprietaires"
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

          Retour aux propriétaires
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
          {error ||
            "Propriétaire introuvable."}
        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">

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

        <div className="flex items-center gap-4">

          <Link
            href="/proprietaires"
            className="
              rounded-lg
              border
              border-slate-300
              bg-white
              p-2
              text-slate-600
              hover:bg-slate-50
            "
          >
            <ArrowLeft size={20} />
          </Link>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-xl
              bg-slate-900
              text-white
            "
          >
            <UserRound size={27} />
          </div>

          <div>

            <p className="text-sm text-slate-500">
              Propriétaire #{proprietaire.id}
            </p>

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              {proprietaire.nom}{" "}
              {proprietaire.prenom}
            </h1>

          </div>

        </div>


        <Link
          href={`/proprietaires/${proprietaire.id}/edit`}
          className="
            inline-flex
            items-center
            justify-center
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
          <Pencil size={17} />

          Modifier
        </Link>

      </div>


      {/* INFORMATIONS */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-2
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

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Informations personnelles
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex gap-3">

              <UserRound
                size={19}
                className="mt-0.5 text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Nom complet
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {proprietaire.nom}{" "}
                  {proprietaire.prenom}
                </p>

              </div>

            </div>


            <div className="flex gap-3">

              <Phone
                size={19}
                className="mt-0.5 text-slate-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Téléphone
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {proprietaire.telephone}
                </p>

              </div>

            </div>


            {proprietaire.email && (
              <div className="flex gap-3">

                <Mail
                  size={19}
                  className="mt-0.5 text-slate-400"
                />

                <div>

                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {proprietaire.email}
                  </p>

                </div>

              </div>
            )}


            {proprietaire.adresse && (
              <div className="flex gap-3">

                <MapPin
                  size={19}
                  className="mt-0.5 text-slate-400"
                />

                <div>

                  <p className="text-xs text-slate-400">
                    Adresse
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {proprietaire.adresse}
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>


        {/* PARCELLES */}

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

          <div className="flex items-center justify-between">

            <div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Parcelles attribuées
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {proprietaire.parcelles?.length ?? 0} parcelle(s)
              </p>

            </div>

            <LandPlot
              size={24}
              className="text-slate-400"
            />

          </div>


          <div className="mt-6 space-y-3">

            {proprietaire.parcelles &&
            proprietaire.parcelles.length > 0 ? (
              proprietaire.parcelles.map(
                (parcelle) => (
                  <div
                    key={parcelle.id}
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {parcelle.reference}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Parcelle {parcelle.numero}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-medium text-slate-700">
                          {parcelle.superficie.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          m²
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {parcelle.statut}
                        </p>

                      </div>

                    </div>

                  </div>
                ),
              )
            ) : (
              <div
                className="
                  rounded-lg
                  border
                  border-dashed
                  border-slate-300
                  px-4
                  py-10
                  text-center
                "
              >
                <LandPlot
                  size={30}
                  className="
                    mx-auto
                    text-slate-400
                  "
                />

                <p className="mt-3 text-sm text-slate-500">
                  Aucune parcelle attribuée.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
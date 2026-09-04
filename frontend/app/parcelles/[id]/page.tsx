"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileSearch,
  LandPlot,
  Pencil,
  Ruler,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  getParcelle,
  deleteParcelle,
  Parcelle,
} from "@/services/parcelles";

import {
  getComparaisonParcelle,
  type ComparaisonRecensement,
} from "@/services/comparaison-recensement.service";

function formatMoney(
  value: number | null | undefined,
) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "—";
  }

  return `${new Intl.NumberFormat("fr-FR").format(
    Number(value),
  )} FCFA`;
}

function getSituationLabel(
  situation: ComparaisonRecensement["recensement"]["situation"],
) {
  switch (situation) {
    case "VENDUE":
      return "Vendue";

    case "DONNEE":
      return "Donnée";

    case "PRISE_ANARCHIQUEMENT":
      return "Prise anarchiquement";

    case "A_VERIFIER":
      return "À vérifier";

    case "AUTRE":
      return "Autre";

    default:
      return situation;
  }
}

function getNiveauLabel(
  niveau: ComparaisonRecensement["comparaison"]["niveau"],
) {
  switch (niveau) {
    case "COHERENT":
      return "Cohérent";

    case "A_VERIFIER":
      return "À vérifier";

    case "ANOMALIE":
      return "Anomalie";

    default:
      return niveau;
  }
}

function NiveauBadge({
  niveau,
}: {
  niveau: ComparaisonRecensement["comparaison"]["niveau"];
}) {
  if (niveau === "COHERENT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Cohérent
      </span>
    );
  }

  if (niveau === "ANOMALIE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
        <XCircle className="h-4 w-4" />
        Anomalie
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
      <AlertTriangle className="h-4 w-4" />
      À vérifier
    </span>
  );
}

function SituationBadge({
  situation,
}: {
  situation: ComparaisonRecensement["recensement"]["situation"];
}) {
  const styles: Record<
    ComparaisonRecensement["recensement"]["situation"],
    string
  > = {
    VENDUE:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    DONNEE:
      "border-blue-200 bg-blue-50 text-blue-700",
    PRISE_ANARCHIQUEMENT:
      "border-red-200 bg-red-50 text-red-700",
    A_VERIFIER:
      "border-amber-200 bg-amber-50 text-amber-700",
    AUTRE:
      "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${styles[situation]}`}
    >
      {getSituationLabel(situation)}
    </span>
  );
}

export default function ParcelleDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [parcelle, setParcelle] =
    useState<Parcelle | null>(null);

  const [comparaison, setComparaison] =
    useState<ComparaisonRecensement | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [comparaisonLoading, setComparaisonLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [comparaisonError, setComparaisonError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getParcelle(id);

        setParcelle(data);
      } catch (error) {
        console.error(
          "Erreur chargement parcelle :",
          error,
        );

        setError(
          "Impossible de charger la parcelle.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  useEffect(() => {
    async function loadComparaison() {
      try {
        setComparaisonLoading(true);
        setComparaisonError("");
        setComparaison(null);

        const data =
          await getComparaisonParcelle(id);

        setComparaison(data);
      } catch (error) {
        console.error(
          "Erreur chargement comparaison :",
          error,
        );

        /*
         * Une parcelle peut ne pas encore avoir
         * de recensement. Ce cas n'est pas une
         * erreur bloquante pour la fiche parcelle.
         */
        const message =
          error instanceof Error
            ? error.message
            : "";

        if (
          message.includes("404") ||
          message.toLowerCase().includes(
            "recensement",
          )
        ) {
          setComparaison(null);
          setComparaisonError("");
        } else {
          setComparaisonError(
            "Impossible de charger la comparaison avec LANDIS.",
          );
        }
      } finally {
        setComparaisonLoading(false);
      }
    }

    if (id) {
      loadComparaison();
    }
  }, [id]);

  async function handleDelete() {
    if (!parcelle) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer "${parcelle.reference}" ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteParcelle(
        parcelle.id,
      );

      router.push("/parcelles");
    } catch (error) {
      console.error(
        "Erreur suppression :",
        error,
      );

      setError(
        "Impossible de supprimer cette parcelle. Une parcelle attribuée ne peut pas être supprimée.",
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error && !parcelle) {
    return (
      <div className="space-y-6">
        <Link
          href="/parcelles"
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

          Retour aux parcelles
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

  if (!parcelle) {
    return null;
  }

  const transaction =
    comparaison?.landis.transactions
      .transactionActive;

  return (
    <div className="space-y-8">
      <Link
        href="/parcelles"
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

        Retour aux parcelles
      </Link>

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

      {/* En-tête */}

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
            <LandPlot size={26} />
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
                {parcelle.reference}
              </h1>

              <span
                className="
                  rounded-full
                  bg-green-50
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-green-700
                "
              >
                {parcelle.statut}
              </span>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Parcelle n° {parcelle.numero}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/parcelles/${parcelle.id}/edit`}
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
          </Link>

          <Link
            href="/recensements/comparaison"
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
            <FileSearch size={17} />

            Comparer avec LANDIS
          </Link>

          <button
            type="button"
            onClick={handleDelete}
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
            "
          >
            <Trash2 size={17} />

            Supprimer
          </button>
        </div>
      </div>

      {/* Informations principales */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
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
            Superficie
          </h2>

          <div className="mt-5 flex items-center gap-3">
            <Ruler
              size={22}
              className="text-slate-400"
            />

            <p
              className="
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {parcelle.superficie.toLocaleString(
                "fr-FR",
              )}{" "}
              m²
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
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Bloc
          </h2>

          <p
            className="
              mt-5
              text-xl
              font-bold
              text-slate-900
            "
          >
            {parcelle.bloc?.reference ||
              `Bloc #${parcelle.blocId}`}
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
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Propriétaire
          </h2>

          {parcelle.proprietaire ? (
            <div className="mt-5">
              <div className="flex items-center gap-3">
                <UserRound
                  size={22}
                  className="text-slate-400"
                />

                <p
                  className="
                    font-semibold
                    text-slate-900
                  "
                >
                  {
                    parcelle.proprietaire
                      .nom
                  }{" "}
                  {
                    parcelle.proprietaire
                      .prenom
                  }
                </p>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {
                  parcelle.proprietaire
                    .telephone
                }
              </p>

              {parcelle
                .proprietaire
                .email && (
                <p className="mt-1 text-sm text-slate-500">
                  {
                    parcelle
                      .proprietaire
                      .email
                  }
                </p>
              )}
            </div>
          ) : (
            <p
              className="
                mt-5
                text-sm
                text-slate-500
              "
            >
              Cette parcelle n'a pas encore
              été attribuée.
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
       * COMPARAISON RECENSEMENT ↔ LANDIS
       * ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-200
            bg-slate-50
            px-6
            py-5
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <FileSearch className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Situation terrain ↔ LANDIS
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Comparaison du dernier recensement
                  avec les données enregistrées dans
                  LANDIS.
                </p>
              </div>
            </div>

            <Link
              href="/recensements/comparaison"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                font-medium
                text-slate-700
                hover:bg-slate-100
              "
            >
              <FileSearch className="h-4 w-4" />
              Voir toutes les comparaisons
            </Link>
          </div>
        </div>

        {comparaisonLoading ? (
          <div className="p-6">
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : comparaisonError ? (
          <div className="p-6">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-medium">
                  Comparaison indisponible
                </p>

                <p className="mt-1">
                  {comparaisonError}
                </p>

                <Link
                  href="/recensements/comparaison"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Ouvrir la comparaison
                </Link>
              </div>
            </div>
          </div>
        ) : !comparaison ? (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div className="rounded-xl bg-white p-3 text-slate-400 shadow-sm">
                <FileSearch className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-medium text-slate-900">
                Aucun recensement enregistré
              </h3>

              <p className="mt-1 max-w-lg text-sm text-slate-500">
                Cette parcelle n'a pas encore fait
                l'objet d'un recensement. La
                comparaison avec LANDIS sera
                disponible après l'enregistrement
                d'un constat de terrain.
              </p>

              <Link
                href={`/recensements/nouveau?parcelleId=${parcelle.id}`}
                className="
                  mt-4
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
                Créer un recensement
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Résultat général */}

            <div
              className="
                flex
                flex-col
                gap-4
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-5
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Résultat de la comparaison
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <NiveauBadge
                    niveau={
                      comparaison.comparaison
                        .niveau
                    }
                  />

                  <span className="text-sm text-slate-500">
                    {getNiveauLabel(
                      comparaison.comparaison
                        .niveau,
                    )}
                  </span>
                </div>
              </div>

              <Link
                href={`/recensements/${comparaison.recensement.id}`}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-slate-700
                  hover:bg-slate-100
                "
              >
                <Eye className="h-4 w-4" />
                Voir le recensement
              </Link>
            </div>

            {/* Comparaison des situations */}

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Constat de terrain
                </p>

                <div className="mt-3">
                  <SituationBadge
                    situation={
                      comparaison.recensement
                        .situation
                    }
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Occupant
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {[
                        comparaison.recensement
                          .occupant.prenom,
                        comparaison.recensement
                          .occupant.nom,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                        "Non renseigné"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Famille
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {comparaison.recensement
                        .famille?.nom ||
                        "Non renseignée"}
                    </span>
                  </div>

                  {comparaison.recensement
                    .vendeurDonateur && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Vendeur / donateur
                      </span>

                      <span className="text-right font-medium text-slate-800">
                        {[
                          comparaison.recensement
                            .vendeurDonateur
                            .prenom,
                          comparaison.recensement
                            .vendeurDonateur
                            .nom,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Coopération
                    </span>

                    <span
                      className={`font-medium ${
                        comparaison.recensement
                          .cooperative
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {comparaison.recensement
                        .cooperative
                        ? "Coopératif"
                        : "Non coopératif"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Données LANDIS
                </p>

                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {comparaison.landis.parcelle
                      .statut}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Parcelle
                    </span>

                    <span className="font-medium text-slate-800">
                      {
                        comparaison.landis
                          .parcelle.reference
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Transactions
                    </span>

                    <span className="font-medium text-slate-800">
                      {
                        comparaison.landis
                          .transactions
                          .nombre
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Transactions validées
                    </span>

                    <span className="font-medium text-slate-800">
                      {
                        comparaison.landis
                          .transactions
                          .nombreValidees
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Transaction active
                    </span>

                    <span className="font-medium text-slate-800">
                      {transaction
                        ? transaction.statut
                        : "Aucune"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations financières */}

            {(comparaison.recensement
              .montantTotal != null ||
              transaction) && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">
                    Montant déclaré au recensement
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatMoney(
                      comparaison.recensement
                        .montantTotal,
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">
                    Montant payé déclaré
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatMoney(
                      comparaison.recensement
                        .montantPaye,
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">
                    Prix enregistré dans LANDIS
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatMoney(
                      transaction?.prix,
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Anomalies */}

            {comparaison.comparaison
              .anomalies.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <h3 className="font-medium text-red-900">
                      Anomalies détectées
                    </h3>

                    <ul className="mt-2 space-y-1 text-sm text-red-800">
                      {comparaison.comparaison
                        .anomalies.map(
                          (item, index) => (
                            <li key={index}>
                              • {item}
                            </li>
                          ),
                        )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Avertissements */}

            {comparaison.comparaison
              .avertissements.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <h3 className="font-medium text-amber-900">
                      Points à vérifier
                    </h3>

                    <ul className="mt-2 space-y-1 text-sm text-amber-800">
                      {comparaison.comparaison
                        .avertissements.map(
                          (item, index) => (
                            <li key={index}>
                              • {item}
                            </li>
                          ),
                        )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Observations */}

            {comparaison.comparaison
              .observations.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <h3 className="font-medium text-blue-900">
                      Observations
                    </h3>

                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      {comparaison.comparaison
                        .observations.map(
                          (item, index) => (
                            <li key={index}>
                              • {item}
                            </li>
                          ),
                        )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Pièces et participants */}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Pièces
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    comparaison.documents
                      .nombre
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Signataires
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    comparaison.signataires
                      .nombre
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Autorités de l'État
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    comparaison.autorites
                      .nombre
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
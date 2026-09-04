"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  ShieldCheck,
  ShieldOff,
  Crown,
  UserRound,
  HandCoins,
  Gift,
  MoreHorizontal,
  Search,
  LandPlot,
} from "lucide-react";

import {
  getFamillesFoncieres,
  deleteFamilleFonciere,
  FamilleFonciere,
  TypeDroitFamille,
} from "@/services/familles-foncieres.service";

export default function FamillesFoncieresPage() {
  const [familles, setFamilles] = useState<
    FamilleFonciere[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<
    "TOUTES" | "ACTIVES" | "INACTIVES"
  >("TOUTES");

  async function loadFamilles() {
    try {
      setLoading(true);
      setError("");

      const data = await getFamillesFoncieres();

      setFamilles(data);
    } catch (err: any) {
      console.error(
        "Erreur chargement familles foncières :",
        err,
      );

      setError(
        err.message ||
          "Impossible de charger les familles foncières.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFamilles();
  }, []);

  async function handleDelete(
    id: number,
    nom: string,
  ) {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer la famille "${nom}" ?\n\nCette suppression peut également supprimer ses membres et ses droits associés.`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteFamilleFonciere(id);

      await loadFamilles();
    } catch (err: any) {
      console.error(
        "Erreur suppression famille foncière :",
        err,
      );

      setError(
        err.message ||
          "Erreur lors de la suppression de la famille foncière.",
      );
    }
  }

  const famillesFiltrees = useMemo(() => {
    const terme = search.trim().toLowerCase();

    return familles.filter((famille) => {
      const correspondRecherche =
        !terme ||
        famille.nom.toLowerCase().includes(terme) ||
        famille.description
          ?.toLowerCase()
          .includes(terme) ||
        famille.terrain?.reference
          ?.toLowerCase()
          .includes(terme) ||
        famille.terrain?.nom
          ?.toLowerCase()
          .includes(terme);

      const correspondStatut =
        filtreStatut === "TOUTES" ||
        (filtreStatut === "ACTIVES" && famille.active) ||
        (filtreStatut === "INACTIVES" && !famille.active);

      return (
        correspondRecherche &&
        correspondStatut
      );
    });
  }, [familles, search, filtreStatut]);

  const nombreActives = familles.filter(
    (famille) => famille.active,
  ).length;

  const nombreInactives = familles.filter(
    (famille) => !famille.active,
  ).length;

  const nombrePrincipales = familles.filter(
    (famille) => famille.estPrincipale,
  ).length;

  const nombreMembres = familles.reduce(
    (total, famille) =>
      total + (famille.membres?.length || 0),
    0,
  );

  const nombreDroits = familles.reduce(
    (total, famille) =>
      total + (famille.droits?.length || 0),
    0,
  );

  function compterDroits(
    famille: FamilleFonciere,
    type: TypeDroitFamille,
  ) {
    return (
      famille.droits?.filter(
        (droit) =>
          droit.type === type &&
          droit.actif,
      ).length || 0
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href="/terrains"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux terrains
      </Link>

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Familles foncières
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gestion des familles, membres et droits fonciers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadFamilles}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>

          <Link
            href="/familles-foncieres/new"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Nouvelle famille
          </Link>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTIQUES */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Familles
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {familles.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Familles actives
            </p>

            <ShieldCheck
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {nombreActives}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Familles principales
            </p>

            <Crown
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {nombrePrincipales}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Membres
            </p>

            <UserRound
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {nombreMembres}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Droits actifs
            </p>

            <ShieldCheck
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {nombreDroits}
          </p>
        </div>
      </div>

      {/* RECHERCHE ET FILTRES */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher une famille, un terrain..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setFiltreStatut("TOUTES")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filtreStatut === "TOUTES"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Toutes
            </button>

            <button
              type="button"
              onClick={() =>
                setFiltreStatut("ACTIVES")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filtreStatut === "ACTIVES"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Actives ({nombreActives})
            </button>

            <button
              type="button"
              onClick={() =>
                setFiltreStatut("INACTIVES")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filtreStatut === "INACTIVES"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Inactives ({nombreInactives})
            </button>
          </div>
        </div>
      </div>

      {/* RESULTAT DE RECHERCHE */}

      {search || filtreStatut !== "TOUTES" ? (
        <div className="text-sm text-slate-500">
          {famillesFiltrees.length} famille
          {famillesFiltrees.length > 1
            ? "s"
            : ""}{" "}
          affichée
          {famillesFiltrees.length > 1
            ? "s"
            : ""}
        </div>
      ) : null}

      {/* LISTE */}

      {famillesFiltrees.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {famillesFiltrees.map((famille) => {
            const membres =
              famille.membres || [];

            const droits =
              famille.droits || [];

            const droitsVendre =
              compterDroits(
                famille,
                "VENDRE",
              );

            const droitsDonner =
              compterDroits(
                famille,
                "DONNER",
              );

            const droitsAutres =
              compterDroits(
                famille,
                "AUTRE",
              );

            return (
              <div
                key={famille.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* IDENTITÉ */}

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {famille.estPrincipale && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          <Crown size={12} />
                          Principale
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          famille.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {famille.active ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldOff size={12} />
                        )}

                        {famille.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Famille
                    </span>

                    <h3 className="mt-0.5 truncate text-xl font-bold text-slate-900">
                      {famille.nom}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                      {famille.description ||
                        "Aucune description"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Users size={20} />
                  </div>
                </div>

                {/* INFORMATIONS */}

                <div className="mt-6 space-y-3.5 border-b border-t border-slate-100 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <LandPlot size={16} />
                      <span>Terrain</span>
                    </div>

                    <span className="max-w-[180px] truncate font-semibold text-slate-800">
                      {famille.terrain?.reference ||
                        `Terrain #${famille.terrainId}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <UserRound size={16} />
                      <span>Membres</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {membres.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <ShieldCheck size={16} />
                      <span>Droits</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {droits.length}
                    </span>
                  </div>
                </div>

                {/* DROITS */}

                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Droits actifs
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-3 text-center">
                      <HandCoins
                        size={16}
                        className="mx-auto text-slate-500"
                      />

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {droitsVendre}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Vendre
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-3 text-center">
                      <Gift
                        size={16}
                        className="mx-auto text-slate-500"
                      />

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {droitsDonner}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Donner
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-3 text-center">
                      <MoreHorizontal
                        size={16}
                        className="mx-auto text-slate-500"
                      />

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {droitsAutres}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Autres
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex items-center justify-end gap-2">
                  <Link
                    href={`/familles-foncieres/${famille.id}`}
                    title="Voir"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                  </Link>

                  <Link
                    href={`/familles-foncieres/${famille.id}/edit`}
                    title="Modifier"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() =>
                      handleDelete(
                        famille.id,
                        famille.nom,
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          <Users
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          {familles.length > 0 ? (
            <>
              <p className="font-medium">
                Aucune famille ne correspond aux critères.
              </p>

              <p className="mt-1 text-sm">
                Modifiez votre recherche ou vos filtres.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">
                Aucune famille foncière disponible pour le moment.
              </p>

              <p className="mt-1 text-sm">
                Créez votre première famille foncière.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
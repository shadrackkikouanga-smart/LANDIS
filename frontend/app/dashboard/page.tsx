"use client";

import { useEffect, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  FileCheck2,
  FolderKanban,
  LandPlot,
  Map,
  Receipt,
  Ruler,
  Users,
  UserRoundCheck,
  Building2,
  Layers3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

import { getDashboard } from "@/services/dashboard";

interface DashboardStats {
  projets: number;

  terrains: {
    nombre: number;
    superficieTotale: number;
  };

  blocs: {
    nombreDeclares: number;
    nombreReels: number;
    ecart: number;
  };

  parcelles: {
    nombreDeclarees: number;
    nombreReelles: number;
    ecart: number;
    disponibles: number;
    attribuees: number;
  };

  proprietaires: number;
  acquereurs: number;

  transactions: {
    total: number;
  };

  finances: {
    montantTotal: number;
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(
    Number(value) || 0,
  );
}

function formatSurface(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboard();

        setStats(data);
      } catch (error) {
        console.error(
          "Erreur chargement dashboard :",
          error,
        );
      }
    }

    loadDashboard();
  }, []);

  if (!stats) {
    return (
      <div
        className="
          min-h-full
          bg-gray-50
          p-6
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
            className="
              animate-pulse
              space-y-6
            "
          >
            <div>
              <div
                className="
                  h-8
                  w-64
                  rounded-lg
                  bg-gray-200
                "
              />

              <div
                className="
                  mt-3
                  h-4
                  w-96
                  max-w-full
                  rounded
                  bg-gray-200
                "
              />
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-36
                      rounded-2xl
                      bg-gray-200
                    "
                  />
                ),
              )}
            </div>

            <div
              className="
                h-96
                rounded-3xl
                bg-gray-200
              "
            />
          </div>
        </div>
      </div>
    );
  }

  const totalParcelles =
    stats.parcelles.nombreReelles;

  const disponibles =
    stats.parcelles.disponibles;

  const attribuees =
    stats.parcelles.attribuees;

  const tauxOccupation =
    totalParcelles > 0
      ? Math.round(
          (attribuees / totalParcelles) *
            100,
        )
      : 0;

  const tauxDisponibilite =
    totalParcelles > 0
      ? Math.round(
          (disponibles / totalParcelles) *
            100,
        )
      : 0;

  const ecartParcelles =
    stats.parcelles.ecart;

  const ecartBlocs =
    stats.blocs.ecart;

  return (
    <div
      className="
        min-h-full
        bg-gray-50
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
          p-6
          lg:p-8
        "
      >
        {/* =====================================================
            EN-TÊTE
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-gray-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-gray-600
                shadow-sm
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                "
              />

              Système opérationnel
            </div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-gray-900
                lg:text-4xl
              "
            >
              Tableau de bord
              <span className="text-gray-400">
                {" "}
                NIANI'S IMO
              </span>
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
              "
            >
              Une vue globale de votre activité
              de lotissement, de vos parcelles
              et de vos opérations.
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gray-900
                text-white
              "
            >
              <Building2
                className="
                  h-5
                  w-5
                "
              />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-400
                "
              >
                Superficie gérée
              </p>

              <p
                className="
                  text-sm
                  font-bold
                  text-gray-900
                "
              >
                {formatSurface(
                  stats.terrains.superficieTotale,
                )}{" "}
                m²
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            VUE GÉNÉRALE
        ===================================================== */}

        <section>
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-5
                w-1
                rounded-full
                bg-gray-900
              "
            />

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                "
              >
                Vue générale
              </h2>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <StatCard
              title="Projets"
              value={stats.projets}
              icon={
                <FolderKanban
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description="Projets enregistrés"
            />

            <StatCard
              title="Terrains"
              value={stats.terrains.nombre}
              icon={
                <Map
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description={`${formatSurface(
                stats.terrains.superficieTotale,
              )} m² au total`}
            />

            <StatCard
              title="Blocs"
              value={stats.blocs.nombreReels}
              icon={
                <Layers3
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description="Blocs réellement enregistrés"
            />

            <StatCard
              title="Parcelles"
              value={stats.parcelles.nombreReelles}
              icon={
                <LandPlot
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description={`${formatNumber(
                stats.parcelles.nombreDeclarees,
              )} déclarées`}
            />
          </div>
        </section>

        {/* =====================================================
            PARCELLAIRE
        ===================================================== */}

        <section>
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-5
                w-1
                rounded-full
                bg-gray-900
              "
            />

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                "
              >
                Situation parcellaire
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-gray-500
                "
              >
                État actuel du parcellaire enregistré
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <StatCard
              title="Disponibles"
              value={disponibles}
              icon={
                <CheckCircle2
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description={`${tauxDisponibilite}% du parcellaire`}
            />

            <StatCard
              title="Attribuées"
              value={attribuees}
              icon={
                <LandPlot
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description={`${tauxOccupation}% du parcellaire`}
            />

            <StatCard
              title="Propriétaires"
              value={stats.proprietaires}
              icon={
                <Users
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description="Propriétaires enregistrés"
            />

            <StatCard
              title="Acquéreurs"
              value={stats.acquereurs}
              icon={
                <UserRoundCheck
                  className="
                    h-5
                    w-5
                  "
                />
              }
              description="Acquéreurs enregistrés"
            />
          </div>
        </section>

        {/* =====================================================
            ACTIVITÉ ET FINANCES
        ===================================================== */}

        <section>
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-5
                w-1
                rounded-full
                bg-gray-900
              "
            />

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                "
              >
                Activité commerciale
              </h2>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >
            <div
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                bg-gray-900
                p-6
                text-white
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-white/5
                  transition-transform
                  duration-500
                  group-hover:scale-125
                "
              />

              <div
                className="
                  relative
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-white/60
                    "
                  >
                    Transactions
                  </p>

                  <p
                    className="
                      mt-3
                      text-4xl
                      font-bold
                      tracking-tight
                    "
                  >
                    {formatNumber(
                      stats.transactions.total,
                    )}
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-white/50
                    "
                  >
                    opérations commerciales enregistrées
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/10
                    text-white
                  "
                >
                  <Receipt
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>
              </div>

              <div
                className="
                  relative
                  mt-8
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-white/60
                "
              >
                <ArrowUpRight
                  className="
                    h-4
                    w-4
                  "
                />

                Suivi des opérations commerciales
              </div>
            </div>

            <div
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <div
                className="
                  absolute
                  -right-12
                  -top-12
                  h-32
                  w-32
                  rounded-full
                  bg-emerald-50
                  transition-transform
                  duration-500
                  group-hover:scale-125
                "
              />

              <div
                className="
                  relative
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-gray-500
                    "
                  >
                    Montant encaissé
                  </p>

                  <p
                    className="
                      mt-3
                      text-4xl
                      font-bold
                      tracking-tight
                      text-gray-900
                    "
                  >
                    {formatMoney(
                      stats.finances.montantTotal,
                    )}
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-gray-500
                    "
                  >
                    montant total des paiements enregistrés
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CircleDollarSign
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>
              </div>

              <div
                className="
                  relative
                  mt-8
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-gray-400
                "
              >
                <ArrowUpRight
                  className="
                    h-4
                    w-4
                    text-emerald-500
                  "
                />

                Paiements enregistrés dans NIANI'S IMO
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTRÔLE DU LOTISSEMENT
        ===================================================== */}

        <section>
          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-5
                w-1
                rounded-full
                bg-gray-900
              "
            />

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-900
                "
              >
                Contrôle du lotissement
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-gray-500
                "
              >
                Comparaison entre les données déclarées et enregistrées
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              lg:grid-cols-2
            "
          >
            {/* Contrôle parcelles */}
            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Ruler
                      className="
                        h-5
                        w-5
                        text-gray-600
                      "
                    />

                    <h3
                      className="
                        font-semibold
                        text-gray-900
                      "
                    >
                      Parcelles
                    </h3>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Déclarées contre réellement enregistrées
                  </p>
                </div>

                {ecartParcelles === 0 ? (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-emerald-700
                    "
                  >
                    <CheckCircle2
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    Conforme
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-amber-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-amber-700
                    "
                  >
                    <AlertTriangle
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    Écart
                  </div>
                )}
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-3
                  divide-x
                  divide-gray-100
                "
              >
                <div className="pr-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Déclarées
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-gray-900
                    "
                  >
                    {formatNumber(
                      stats.parcelles.nombreDeclarees,
                    )}
                  </p>
                </div>

                <div className="px-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Réelles
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-gray-900
                    "
                  >
                    {formatNumber(
                      stats.parcelles.nombreReelles,
                    )}
                  </p>
                </div>

                <div className="pl-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Écart
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xl
                      font-bold
                      ${
                        ecartParcelles === 0
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    `}
                  >
                    {ecartParcelles > 0
                      ? `+${formatNumber(
                          ecartParcelles,
                        )}`
                      : formatNumber(
                          ecartParcelles,
                        )}
                  </p>
                </div>
              </div>
            </div>

            {/* Contrôle blocs */}
            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FileCheck2
                      className="
                        h-5
                        w-5
                        text-gray-600
                      "
                    />

                    <h3
                      className="
                        font-semibold
                        text-gray-900
                      "
                    >
                      Blocs
                    </h3>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                    "
                  >
                    Contrôle des blocs enregistrés
                  </p>
                </div>

                {ecartBlocs === 0 ? (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-emerald-700
                    "
                  >
                    <CheckCircle2
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    Conforme
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-amber-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-amber-700
                    "
                  >
                    <AlertTriangle
                      className="
                        h-3.5
                        w-3.5
                      "
                    />

                    Écart
                  </div>
                )}
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-3
                  divide-x
                  divide-gray-100
                "
              >
                <div className="pr-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Déclarés
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-gray-900
                    "
                  >
                    {formatNumber(
                      stats.blocs.nombreDeclares,
                    )}
                  </p>
                </div>

                <div className="px-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Réels
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-gray-900
                    "
                  >
                    {formatNumber(
                      stats.blocs.nombreReels,
                    )}
                  </p>
                </div>

                <div className="pl-4">
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    Écart
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xl
                      font-bold
                      ${
                        ecartBlocs === 0
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    `}
                  >
                    {ecartBlocs > 0
                      ? `+${formatNumber(
                          ecartBlocs,
                        )}`
                      : formatNumber(
                          ecartBlocs,
                        )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ACTIVITÉ RÉCENTE
        ===================================================== */}

        <section>
          <RecentActivity />
        </section>
      </div>
    </div>
  );
}
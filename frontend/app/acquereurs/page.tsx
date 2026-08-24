"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  getAcquereurs,
  type Acquereur,
} from "@/services/acquereurs";

import AcquereurCard from "@/components/acquereurs/AcquereurCard";

export default function AcquereursPage() {
  const [acquereurs, setAcquereurs] =
    useState<Acquereur[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadAcquereurs() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAcquereurs();

      setAcquereurs(data);
    } catch (error) {
      console.error(
        "Erreur chargement acquéreurs :",
        error,
      );

      setError(
        "Impossible de charger les acquéreurs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAcquereurs();
  }, []);

  return (
    <div className="space-y-8">
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
              Acquéreurs
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gestion des acquéreurs des parcelles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAcquereurs}
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
            href="/acquereurs/new"
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
            Nouvel acquéreur
          </Link>
        </div>
      </div>

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

      {!loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
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
            <div className="flex items-center gap-3">
              <Users
                size={20}
                className="text-slate-500"
              />

              <div>
                <p className="text-sm text-slate-500">
                  Nombre total
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {acquereurs.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {!loading &&
        acquereurs.length === 0 && (
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
              Aucun acquéreur
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Commencez par enregistrer
              votre premier acquéreur.
            </p>

            <Link
              href="/acquereurs/new"
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
              Créer un acquéreur
            </Link>
          </div>
        )}

      {!loading &&
        acquereurs.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {acquereurs.map(
              (acquereur) => (
                <AcquereurCard
                  key={acquereur.id}
                  acquereur={acquereur}
                  onDeleted={
                    loadAcquereurs
                  }
                />
              ),
            )}
          </div>
        )}
    </div>
  );
}
"use client";

import {
  Map,
  Layers,
} from "lucide-react";

import { useState } from "react";
import dynamic from "next/dynamic";

const LandisMap = dynamic(
  () => import("@/components/map/LandisMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="
          flex
          h-[600px]
          w-full
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <p className="text-sm text-slate-500">
          Chargement de la carte...
        </p>
      </div>
    ),
  },
);

export default function CartePage() {
  const [search, setSearch] =
    useState("");

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-lg
              bg-slate-900
              text-white
            "
          >
            <Map size={22} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Carte
            </h1>

            <p
              className="
                mt-1
                text-slate-500
              "
            >
              Visualisez les terrains, blocs et parcelles de LANDIS.
            </p>
          </div>

        </div>
      </div>

        {/* Carte */}
      <LandisMap />

    </div>
  );
}
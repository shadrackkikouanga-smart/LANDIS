"use client";

import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  UserRound,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import {
  deleteAcquereur,
  type Acquereur,
} from "@/services/acquereurs";

interface AcquereurCardProps {
  acquereur: Acquereur;
  onDeleted: () => void;
}

export default function AcquereurCard({
  acquereur,
  onDeleted,
}: AcquereurCardProps) {
  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer ${acquereur.prenom} ${acquereur.nom} ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAcquereur(
        acquereur.id,
      );

      onDeleted();
    } catch (error) {
      console.error(
        "Erreur suppression acquéreur :",
        error,
      );

      window.alert(
        "Impossible de supprimer cet acquéreur.",
      );
    }
  }

  const nombreTransactions =
    acquereur.transactions?.length ?? 0;

  return (
    <div
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
          flex
          items-center
          gap-4
          border-b
          border-slate-100
          px-5
          py-4
        "
      >
        <div
          className="
            rounded-xl
            bg-slate-100
            p-3
          "
        >
          <UserRound
            size={22}
            className="text-slate-700"
          />
        </div>

        <div>
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            {acquereur.prenom}{" "}
            {acquereur.nom}
          </h2>

          <p
            className="
              text-xs
              text-slate-400
            "
          >
            Acquéreur #{acquereur.id}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-5">
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
            {acquereur.telephone}
          </span>
        </div>

        {acquereur.email && (
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
              {acquereur.email}
            </span>
          </div>
        )}

        {acquereur.adresse && (
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
              {acquereur.adresse}
            </span>
          </div>
        )}

        <div
          className="
            mt-4
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
            Transactions
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-slate-700
            "
          >
            {nombreTransactions}
          </p>
        </div>
      </div>

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
          href={`/acquereurs/${acquereur.id}`}
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
          href={`/acquereurs/${acquereur.id}/edit`}
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
          onClick={handleDelete}
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
  );
}
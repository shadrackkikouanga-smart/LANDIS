"use client";

import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import AcquereurForm from "@/components/acquereurs/AcquereurForm";

export default function NewAcquereurPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/acquereurs"
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
          Retour aux acquéreurs
        </Link>
      </div>

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
            Nouvel acquéreur
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Enregistrer un nouvel acquéreur
          </p>
        </div>
      </div>

      <AcquereurForm
        onSuccess={(acquereur) => {
          router.push(
            `/acquereurs/${acquereur.id}`,
          );
        }}
      />
    </div>
  );
}
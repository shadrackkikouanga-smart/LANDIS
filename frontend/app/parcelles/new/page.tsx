"use client";

import { useRouter } from "next/navigation";

import ParcelleForm from "@/components/parcelles/ParcelleForm";

export default function NewParcellePage() {
  const router = useRouter();

  return (
    <ParcelleForm
      onSuccess={() =>
        router.push("/parcelles")
      }
      onCancel={() =>
        router.push("/parcelles")
      }
    />
  );
}
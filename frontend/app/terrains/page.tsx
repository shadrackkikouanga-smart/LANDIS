"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, Eye, Pencil, Trash2, LandPlot, Layers, Layers3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";

export default function TerrainsPage() {
  const router = useRouter();
  const [terrains, setTerrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTerrains() {
    try {
      setLoading(true);
      setError("");
      // Appel vers votre API backend
      const data = await apiRequest("/terrains");
      setTerrains(data);
    } catch (err: any) {
      console.error("Erreur chargement terrains :", err);
      setError("Impossible de charger les terrains.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTerrains(); }, []);

  async function handleDelete(id: number, ref: string) {
    if (!window.confirm(`Voulez-vous vraiment supprimer le terrain "${ref}" ?`)) return;
    try {
      await apiRequest(`/terrains/${id}`, { method: "DELETE" });
      await loadTerrains();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  }

  if (loading) return <div className="p-6 h-40 animate-pulse bg-slate-100 rounded-xl" />;
  return (
    <div className="space-y-8 p-6">
      {/* EN-TÊTE ET ENCART D'ORIGINE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white"><Layers3 size={24} /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Terrains</h1>
            <p className="mt-1 text-sm text-slate-500">Gestion des terrains principaux et parcelles</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadTerrains} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <RefreshCw size={17} /> Actualiser
          </button>
          <Link href="/terrains/new" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><Plus size={18} /> Nouveau terrain</Link>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {/* VOS CASIERS DE STATISTIQUES CONSERVÉS À L'IDENTIQUE */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Nombre de terrains</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{terrains.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Superficie cumulée</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {terrains.reduce((total, t) => total + Number(t.superficie), 0).toLocaleString("fr-FR")} m²
          </p>
        </div>
      </div>

      {/* GRILLE DES CARTES DE TERRAINS AVEC PARCOURS ADAPTÉ DES RELATIONS */}
      {terrains.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {terrains.map((terrain) => {
            // Extraction sécurisée des sous-éléments pour éviter les plantages
            const sectionsReelles = terrain.sections || [];
            const blocsReels = sectionsReelles.flatMap((s: any) => s.blocs || []);

            return (
              <div key={terrain.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Référence</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">{terrain.reference}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Nom : {terrain.nom}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                    terrain.statut === "COMPLET" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {terrain.statut || "En cours"}
                  </span>
                </div>

                <div className="mt-6 space-y-3.5 border-t border-b border-slate-100 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500"><LandPlot size={16} /> <span>Superficie</span></div>
                    <span className="font-semibold text-slate-800">{Number(terrain.superficie).toLocaleString("fr-FR")} m²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500"><Layers size={16} /> <span>Sections incluses</span></div>
                    <span className="font-semibold text-slate-800">{sectionsReelles.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500"><Layers3 size={16} /> <span>Blocs totaux</span></div>
                    <span className="font-semibold text-slate-800">{blocsReels.length}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <Link href={`/terrains/${terrain.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Eye size={16} /></Link>
                  <Link href={`/terrains/${terrain.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={16} /></Link>
                  <button type="button" onClick={() => handleDelete(terrain.id, terrain.reference)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-slate-400 bg-white">
          Aucun terrain disponible pour le moment.
        </div>
      )}
    </div>
  );
}

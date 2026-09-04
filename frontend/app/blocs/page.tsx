"use client";

import { useEffect, useState } from "react";
import { Blocks, RefreshCw, Plus, Eye, Pencil, Trash2, LandPlot, Grid3X3, Layers } from "lucide-react";
import Link from "next/link";
import { getBlocs, deleteBloc, Bloc } from "@/services/blocs";
import { getSections, Section } from "@/services/sections";

export default function BlocsPage() {
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("TOUTES");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [blocsData, sectionsData] = await Promise.all([
        getBlocs(),
        getSections()
      ]);
      setBlocs(blocsData);
      setSections(sectionsData);
    } catch (error) {
      console.error("Erreur chargement :", error);
      setError("Impossible de charger les données des blocs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(bloc: Bloc) {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer le bloc "${bloc.reference}" ?`);
    if (!confirmed) return;
    try {
      await deleteBloc(bloc.id);
      await loadData();
    } catch (error) {
      console.error("Erreur suppression bloc :", error);
      setError(error instanceof Error ? error.message : "Impossible de supprimer le bloc.");
    }
  }

  // Filtrage dynamique des blocs en fonction de la section sélectionnée
  const blocsFiltres = selectedSection === "TOUTES" 
    ? blocs 
    : blocs.filter(bloc => String((bloc as any).sectionId) === selectedSection);

  if (loading) return <div className="p-6 h-40 animate-pulse bg-slate-100 rounded-xl" />;
  return (
    <div className="space-y-8">
      {/* EN-TÊTE EXACT DE VOTRE FICHIER INITIAL */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white"><Blocks size={24} /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blocs</h1>
            <p className="mt-1 text-sm text-slate-500">Gestion des blocs de lotissement</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
          <Link href="/blocs/new" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><Plus size={18} /> Nouveau bloc</Link>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {/* VOS 3 CASIERS DE STATISTIQUES SUPÉRIEURS D'ORIGINE CONSERVÉS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Nombre de blocs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{blocsFiltres.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Superficie totale</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {blocsFiltres.reduce((total, bloc) => total + Number(bloc.superficie), 0).toLocaleString("fr-FR")} m²
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Parcelles déclarées</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {blocsFiltres.reduce((total, bloc) => total + Number(bloc.nombreParcelles), 0)}
          </p>
        </div>
      </div>

      {/* BARRE DE FILTRAGE CHIRURGICALE PAR SECTION */}
      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Layers size={14} /> Filtrer par Section :</label>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold outline-none text-slate-700 shadow-sm">
          <option value="TOUTES">Toutes les sections (Global)</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.reference} — {s.nom}</option>)}
        </select>
      </div>

      {/* GRILLE DES CARTES DE VOTRE MAQUETTE INITIALE REPRISE */}
      {blocsFiltres.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blocsFiltres.map((bloc) => (
            <div key={bloc.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Référence</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{bloc.reference}</h3>
                  {/* AJOUT : Visualisation de la Section parent sous le titre */}
                  <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 rounded px-2 py-0.5 inline-block">Section : {(bloc as any).section?.reference || "N/A"}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                  bloc.statut === "TERMINE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {bloc.statut === "TERMINE" ? "Quadrillage Validé" : "En cours"}
                </span>
              </div>

              <div className="mt-6 space-y-3.5 border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500"><LandPlot size={16} /> <span>Superficie</span></div>
                  <span className="font-semibold text-slate-800">{Number(bloc.superficie).toLocaleString("fr-FR")} m²</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500"><Grid3X3 size={16} /> <span>Parcelles définies</span></div>
                  <span className="font-semibold text-slate-800">{bloc.nombreParcelles}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Link href={`/blocs/${bloc.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Eye size={16} /></Link>
                <Link href={`/blocs/${bloc.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={16} /></Link>
                <button type="button" onClick={() => handleDelete(bloc)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-slate-400 bg-white">
          Aucun bloc disponible pour ce critère.
        </div>
      )}
    </div>
  );
}

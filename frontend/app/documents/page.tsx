"use client";

import { useEffect, useState } from "react";

import {
  FileText,
  FileCheck,
  Download,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getDocuments,
  getDocument,
  createDocument,
  deleteDocument,
} from "@/services/documents";

type DocumentItem = {
  id: number;
  numero: string;
  type: string;
  transactionId: number;
  nomFichier: string;
  chemin?: string | null;
  createdAt: string;
  transaction?: {
    id: number;
  };
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  const [transactionId, setTransactionId] =
    useState("");

  const [type, setType] = useState("");

  const [nomFichier, setNomFichier] =
    useState("");

  async function loadDocuments() {
    try {
      setLoading(true);

      const data = await getDocuments();

      setDocuments(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des documents :",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleCreate() {
    if (
      !transactionId ||
      !type ||
      !nomFichier
    ) {
      alert(
        "Veuillez remplir tous les champs obligatoires.",
      );

      return;
    }

    try {
      setActionLoading(true);

      await createDocument({
        transactionId: Number(transactionId),
        type,
        nomFichier,
      });

      setTransactionId("");
      setType("");
      setNomFichier("");

      setShowCreateForm(false);

      await loadDocuments();
    } catch (error) {
      console.error(
        "Erreur lors de la création du document :",
        error,
      );

      alert(
        "Impossible de créer le document.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleView(id: number) {
    try {
      setActionLoading(true);

      const document = await getDocument(id);

      setSelectedDocument(document);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du document :",
        error,
      );

      alert(
        "Impossible de récupérer le document.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce document ?",
    );

    if (!confirmation) {
      return;
    }

    try {
      setActionLoading(true);

      await deleteDocument(id);

      setSelectedDocument(null);

      await loadDocuments();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression :",
        error,
      );

      alert(
        "Impossible de supprimer le document.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleGenerateContract(
    transactionId: number,
  ) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    const url =
      `${apiUrl}/documents/contrat/${transactionId}/pdf`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );

    setTimeout(() => {
      loadDocuments();
    }, 1500);
  }

  const documentsFiltres =
    documents.filter((document) => {
      const texte =
        `${document.numero} ${document.type} ${document.nomFichier} ${document.transactionId}`
          .toLowerCase();

      return texte.includes(
        search.toLowerCase(),
      );
    });

  const nombreDocuments =
    documents.length;

  const nombreContrats =
    documents.filter(
      (document) =>
        document.type === "CONTRAT_VENTE",
    ).length;

  return (
    <div className="space-y-8">

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm text-slate-500">
            Gestion commerciale
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Documents
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consultez et gérez les documents
            générés par LANDIS.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
            "
          >
            <RefreshCw size={17} />

            Actualiser
          </button>

          <button
            type="button"
            onClick={() =>
              setShowCreateForm(
                !showCreateForm,
              )
            }
            className="
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
            <Plus size={17} />

            Nouveau document
          </button>

        </div>
      </div>

      {/* STATISTIQUES */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Documents
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {nombreDocuments}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <FileText
                size={22}
                className="text-slate-700"
              />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Contrats de vente
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {nombreContrats}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <FileCheck
                size={22}
                className="text-slate-700"
              />
            </div>

          </div>

        </div>

      </div>

      {/* FORMULAIRE DE CRÉATION */}

      {showCreateForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Enregistrer un document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Associez un document à une
              transaction existante.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                ID transaction
              </label>

              <input
                type="number"
                value={transactionId}
                onChange={(event) =>
                  setTransactionId(
                    event.target.value,
                  )
                }
                placeholder="Ex : 1"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:border-slate-400
                "
              />

            </div>

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:border-slate-400
                "
              >

                <option value="">
                  Sélectionner
                </option>

                <option value="CONTRAT_VENTE">
                  Contrat de vente
                </option>

                <option value="AUTRE">
                  Autre document
                </option>

              </select>

            </div>

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nom du fichier
              </label>

              <input
                type="text"
                value={nomFichier}
                onChange={(event) =>
                  setNomFichier(
                    event.target.value,
                  )
                }
                placeholder="Ex : contrat.pdf"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:border-slate-400
                "
              />

            </div>

          </div>

          <div className="mt-5 flex justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(false)
              }
              className="
                rounded-lg
                border
                border-slate-200
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
              "
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={actionLoading}
              className="
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
              "
            >
              {actionLoading
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>

          </div>

        </div>
      )}

      {/* BIBLIOTHÈQUE DOCUMENTAIRE */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Bibliothèque documentaire
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Documents associés aux
                transactions LANDIS.
              </p>

            </div>

            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">

              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Rechercher..."
                className="
                  ml-2
                  w-48
                  bg-transparent
                  text-sm
                  outline-none
                "
              />

            </div>

          </div>

        </div>

        <div className="p-6">

          {loading ? (

            <div className="py-12 text-center text-sm text-slate-500">
              Chargement des documents...
            </div>

          ) : documentsFiltres.length === 0 ? (

            <div className="py-12 text-center">

              <FileText
                size={42}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-medium text-slate-700">
                Aucun document
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Aucun document n'est
                actuellement enregistré.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {documentsFiltres.map(
                (document) => (

                  <div
                    key={document.id}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      p-5
                      transition
                      hover:shadow-md
                    "
                  >

                    <div className="flex items-start justify-between">

                      <div className="rounded-lg bg-slate-100 p-3">

                        <FileText
                          size={21}
                          className="text-slate-700"
                        />

                      </div>

                      <span
                        className="
                          rounded-full
                          bg-slate-100
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          text-slate-600
                        "
                      >
                        {document.type}
                      </span>

                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      {document.numero}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">

                      <p>
                        <strong>
                          Fichier :
                        </strong>{" "}
                        {document.nomFichier}
                      </p>

                      <p>
                        <strong>
                          Transaction :
                        </strong>{" "}
                        #{document.transactionId}
                      </p>

                      <p>
                        <strong>
                          Date :
                        </strong>{" "}
                        {new Date(
                          document.createdAt,
                        ).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleView(
                            document.id,
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-slate-200
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-slate-700
                          hover:bg-slate-50
                        "
                      >

                        <Eye size={16} />

                        Voir

                      </button>

                      {document.type ===
                        "CONTRAT_VENTE" && (

                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateContract(
                              document.transactionId,
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-slate-900
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-slate-800
                          "
                        >

                          <Download
                            size={16}
                          />

                          PDF

                        </button>

                      )}

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          document.id,
                        )
                      }
                      className="
                        mt-2
                        inline-flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-red-600
                        hover:bg-red-50
                      "
                    >

                      <Trash2 size={16} />

                      Supprimer

                    </button>

                  </div>

                ),
              )}

            </div>

          )}

        </div>

      </div>

      {/* MODALE DÉTAILS */}

      {selectedDocument && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              p-6
              shadow-xl
            "
          >

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Détails du document
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(
                    null,
                  )
                }
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>

            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-700">

              <p>
                <strong>
                  Numéro :
                </strong>{" "}
                {selectedDocument.numero}
              </p>

              <p>
                <strong>
                  Type :
                </strong>{" "}
                {selectedDocument.type}
              </p>

              <p>
                <strong>
                  Transaction :
                </strong>{" "}
                #{selectedDocument.transactionId}
              </p>

              <p>
                <strong>
                  Fichier :
                </strong>{" "}
                {selectedDocument.nomFichier}
              </p>

              <p>
                <strong>
                  Chemin :
                </strong>{" "}
                {selectedDocument.chemin ||
                  "-"}
              </p>

              <p>
                <strong>
                  Créé le :
                </strong>{" "}
                {new Date(
                  selectedDocument.createdAt,
                ).toLocaleString(
                  "fr-FR",
                )}
              </p>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(
                    null,
                  )
                }
                className="
                  rounded-lg
                  bg-slate-900
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                "
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
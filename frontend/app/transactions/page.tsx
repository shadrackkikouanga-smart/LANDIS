"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle,
  Clock,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  Transaction,
  TypeTransaction,
  updateTransaction,
} from "@/services/transactions";

import {
  getParcelles,
} from "@/services/parcelles";

import {
  getAcquereurs,
} from "@/services/acquereurs";

interface Parcelle {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;
}

interface Acquereur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

export default function TransactionsPage() {

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [parcelles, setParcelles] =
    useState<Parcelle[]>([]);

  const [acquereurs, setAcquereurs] =
    useState<Acquereur[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState<Transaction | null>(null);

  const [editing, setEditing] =
    useState<Transaction | null>(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    parcelleId: "",
    acquereurId: "",
    type: "VENTE" as TypeTransaction,
    prix: "",
  });


  async function loadData() {

    try {

      setLoading(true);
      setError("");

      const [
        transactionsData,
        parcellesData,
        acquereursData,
      ] = await Promise.all([
        getTransactions(),
        getParcelles(),
        getAcquereurs(),
      ]);

      setTransactions(transactionsData);
      setParcelles(parcellesData);
      setAcquereurs(acquereursData);

    } catch (err) {

      console.error(err);

      setError(
        "Impossible de charger les données.",
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    loadData();
  }, []);


  function resetForm() {

    setForm({
      parcelleId: "",
      acquereurId: "",
      type: "VENTE",
      prix: "",
    });

    setEditing(null);
    setShowForm(false);

  }


  function openCreate() {

    setEditing(null);

    setForm({
      parcelleId: "",
      acquereurId: "",
      type: "VENTE",
      prix: "",
    });

    setShowForm(true);

  }


  function openEdit(
    transaction: Transaction,
  ) {

    setEditing(transaction);

    setForm({
      parcelleId:
        String(transaction.parcelleId),

      acquereurId:
        String(transaction.acquereurId),

      type:
        transaction.type,

      prix:
        transaction.prix !== null
          ? String(transaction.prix)
          : "",
    });

    setShowForm(true);

  }


  async function handleSubmit(
    event: React.FormEvent,
  ) {

    event.preventDefault();

    try {

      setError("");

      if (!form.parcelleId) {
        setError("Veuillez sélectionner une parcelle.");
        return;
      }

      if (!form.acquereurId) {
        setError("Veuillez sélectionner un acquéreur.");
        return;
      }

      const data = {
        parcelleId:
          Number(form.parcelleId),

        acquereurId:
          Number(form.acquereurId),

        type:
          form.type,

        ...(form.prix
          ? {
              prix: Number(form.prix),
            }
          : {}),
      };


      if (editing) {

        await updateTransaction(
          editing.id,
          data,
        );

      } else {

        await createTransaction(data);

      }


      resetForm();

      await loadData();

    } catch (err: any) {

      console.error(err);

      setError(
        err?.response?.data?.message ||
        "Une erreur est survenue.",
      );

    }

  }


  async function handleDelete(
    id: number,
  ) {

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer cette transaction ?",
      );

    if (!confirmation) {
      return;
    }


    try {

      await deleteTransaction(id);

      await loadData();

    } catch (err: any) {

      console.error(err);

      setError(
        err?.response?.data?.message ||
        "Impossible de supprimer la transaction.",
      );

    }

  }


  async function handleValidate(
    transaction: Transaction,
  ) {

    if (transaction.resteAPayer > 0) {

      setError(
        `Impossible de valider cette vente. Reste à payer : ${transaction.resteAPayer.toLocaleString("fr-FR")} FCFA`,
      );

      return;

    }


    try {

      await updateTransaction(
        transaction.id,
        {
          statut: "VALIDEE",
        },
      );

      await loadData();

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Impossible de valider la transaction.",
      );

    }

  }


  async function handleCancel(
    transaction: Transaction,
  ) {

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment annuler cette transaction ?",
      );

    if (!confirmation) {
      return;
    }


    try {

      await updateTransaction(
        transaction.id,
        {
          statut: "ANNULEE",
        },
      );

      await loadData();

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Impossible d'annuler la transaction.",
      );

    }

  }


  const filteredTransactions =
    transactions.filter(
      (transaction) => {

        const text =
          search.toLowerCase();

        return (
          transaction.parcelle.reference
            .toLowerCase()
            .includes(text) ||

          transaction.acquereur.nom
            .toLowerCase()
            .includes(text) ||

          transaction.acquereur.prenom
            .toLowerCase()
            .includes(text) ||

          transaction.acquereur.telephone
            .toLowerCase()
            .includes(text)
        );

      },
    );


  const total =
    transactions.length;

  const enAttente =
    transactions.filter(
      (t) => t.statut === "EN_ATTENTE",
    ).length;

  const validees =
    transactions.filter(
      (t) => t.statut === "VALIDEE",
    ).length;

  const annulees =
    transactions.filter(
      (t) => t.statut === "ANNULEE",
    ).length;


  function statutBadge(
    statut: string,
  ) {

    if (statut === "VALIDEE") {

      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          <CheckCircle size={14} />
          Validée
        </span>
      );

    }


    if (statut === "ANNULEE") {

      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          <XCircle size={14} />
          Annulée
        </span>
      );

    }


    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
        <Clock size={14} />
        En attente
      </span>
    );

  }


  return (

    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gestion des ventes, réservations et transactions foncières.
          </p>

        </div>


        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >

          <Plus size={18} />

          Nouvelle transaction

        </button>

      </div>


      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

      )}


      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <StatCard
          title="Total"
          value={total}
        />

        <StatCard
          title="En attente"
          value={enAttente}
        />

        <StatCard
          title="Validées"
          value={validees}
        />

        <StatCard
          title="Annulées"
          value={annulees}
        />

      </div>


      <div className="rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 p-4">

          <div className="relative max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

              <tr>

                <th className="px-6 py-4">
                  Parcelle
                </th>

                <th className="px-6 py-4">
                  Acquéreur
                </th>

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Prix
                </th>

                <th className="px-6 py-4">
                  Paiement
                </th>

                <th className="px-6 py-4">
                  Statut
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Chargement...
                  </td>

                </tr>

              ) : filteredTransactions.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Aucune transaction trouvée.
                  </td>

                </tr>

              ) : (

                filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">

                        {transaction.parcelle.reference}

                      </td>


                      <td className="px-6 py-4">

                        <div className="font-medium text-gray-900">

                          {transaction.acquereur.nom}{" "}
                          {transaction.acquereur.prenom}

                        </div>

                        <div className="text-xs text-gray-500">

                          {transaction.acquereur.telephone}

                        </div>

                      </td>


                      <td className="px-6 py-4">

                        {transaction.type}

                      </td>


                      <td className="px-6 py-4">

                        {transaction.prix !== null
                          ? `${transaction.prix.toLocaleString("fr-FR")} FCFA`
                          : "—"}

                      </td>


                      <td className="px-6 py-4">

                        <div className="font-medium">

                          {transaction.totalPaye.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          FCFA

                        </div>

                        {transaction.prix !== null && (
                          <div className="text-xs text-gray-500">

                            Reste :{" "}
                            {transaction.resteAPayer.toLocaleString(
                              "fr-FR",
                            )}{" "}
                            FCFA

                          </div>
                        )}

                      </td>


                      <td className="px-6 py-4">

                        {statutBadge(
                          transaction.statut,
                        )}

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              setShowDetails(
                                transaction,
                              )
                            }
                            title="Voir"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                          >
                            <Eye size={17} />
                          </button>


                          {transaction.statut ===
                            "EN_ATTENTE" && (

                            <>

                              <button
                                onClick={() =>
                                  openEdit(
                                    transaction,
                                  )
                                }
                                title="Modifier"
                                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil size={17} />
                              </button>


                              <button
                                onClick={() =>
                                  handleValidate(
                                    transaction,
                                  )
                                }
                                title="Valider"
                                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle size={17} />
                              </button>


                              <button
                                onClick={() =>
                                  handleCancel(
                                    transaction,
                                  )
                                }
                                title="Annuler"
                                className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
                              >
                                <XCircle size={17} />
                              </button>

                            </>

                          )}


                          <button
                            onClick={() =>
                              handleDelete(
                                transaction.id,
                              )
                            }
                            title="Supprimer"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ),
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">

              <h2 className="text-lg font-semibold">

                {editing
                  ? "Modifier la transaction"
                  : "Nouvelle transaction"}

              </h2>

              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Parcelle
                </label>

                <select
                  value={form.parcelleId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      parcelleId:
                        e.target.value,
                    })
                  }
                  disabled={!!editing}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                >

                  <option value="">
                    Sélectionner une parcelle
                  </option>

                  {parcelles
                    .filter(
                      (parcelle) =>
                        parcelle.statut ===
                          "DISPONIBLE" ||
                        (
                          editing &&
                          parcelle.id ===
                            editing.parcelleId
                        ),
                    )
                    .map(
                      (parcelle) => (

                        <option
                          key={parcelle.id}
                          value={parcelle.id}
                        >

                          {parcelle.reference} —{" "}
                          {parcelle.superficie} m²

                        </option>

                      ),
                    )}

                </select>

              </div>


              <div>

                <label className="mb-1 block text-sm font-medium">
                  Acquéreur
                </label>

                <select
                  value={form.acquereurId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      acquereurId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                >

                  <option value="">
                    Sélectionner un acquéreur
                  </option>

                  {acquereurs.map(
                    (acquereur) => (

                      <option
                        key={acquereur.id}
                        value={acquereur.id}
                      >

                        {acquereur.nom}{" "}
                        {acquereur.prenom}

                      </option>

                    ),
                  )}

                </select>

              </div>


              <div>

                <label className="mb-1 block text-sm font-medium">
                  Type de transaction
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type:
                        e.target.value as TypeTransaction,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                >

                  <option value="VENTE">
                    Vente
                  </option>

                  <option value="RESERVATION">
                    Réservation
                  </option>

                  <option value="LOCATION">
                    Location
                  </option>

                </select>

              </div>


              <div>

                <label className="mb-1 block text-sm font-medium">
                  Prix
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.prix}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      prix: e.target.value,
                    })
                  }
                  placeholder="Ex : 5000000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />

              </div>


              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >

                  {editing
                    ? "Enregistrer"
                    : "Créer"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {showDetails && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">

              <h2 className="text-lg font-semibold">
                Détails de la transaction
              </h2>

              <button
                onClick={() =>
                  setShowDetails(null)
                }
                className="text-gray-500"
              >
                ✕
              </button>

            </div>


            <div className="space-y-6 p-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Detail
                  label="Référence parcelle"
                  value={
                    showDetails.parcelle.reference
                  }
                />

                <Detail
                  label="Numéro"
                  value={
                    showDetails.parcelle.numero
                  }
                />

                <Detail
                  label="Superficie"
                  value={`${showDetails.parcelle.superficie} m²`}
                />

                <Detail
                  label="Acquéreur"
                  value={`${showDetails.acquereur.nom} ${showDetails.acquereur.prenom}`}
                />

                <Detail
                  label="Téléphone"
                  value={
                    showDetails.acquereur.telephone
                  }
                />

                <Detail
                  label="Type"
                  value={showDetails.type}
                />

                <Detail
                  label="Prix"
                  value={
                    showDetails.prix !== null
                      ? `${showDetails.prix.toLocaleString("fr-FR")} FCFA`
                      : "—"
                  }
                />

                <Detail
                  label="Total payé"
                  value={`${showDetails.totalPaye.toLocaleString("fr-FR")} FCFA`}
                />

                <Detail
                  label="Reste à payer"
                  value={`${showDetails.resteAPayer.toLocaleString("fr-FR")} FCFA`}
                />

                <div>

                  <p className="text-xs text-gray-500">
                    Statut
                  </p>

                  <div className="mt-1">
                    {statutBadge(
                      showDetails.statut,
                    )}
                  </div>

                </div>

              </div>


              <div>

                <h3 className="mb-3 font-semibold">
                  Paiements
                </h3>

                {showDetails.paiements.length ===
                0 ? (

                  <p className="text-sm text-gray-500">
                    Aucun paiement enregistré.
                  </p>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-gray-50">

                        <tr>

                          <th className="px-3 py-2 text-left">
                            Reçu
                          </th>

                          <th className="px-3 py-2 text-left">
                            Montant
                          </th>

                          <th className="px-3 py-2 text-left">
                            Mode
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {showDetails.paiements.map(
                          (paiement) => (

                            <tr
                              key={paiement.id}
                              className="border-b"
                            >

                              <td className="px-3 py-2">
                                {paiement.numeroRecu}
                              </td>

                              <td className="px-3 py-2">
                                {paiement.montant.toLocaleString(
                                  "fr-FR",
                                )}{" "}
                                FCFA
                              </td>

                              <td className="px-3 py-2">
                                {paiement.modePaiement}
                              </td>

                            </tr>

                          ),
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>

  );

}


function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div>

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>

    </div>

  );

}
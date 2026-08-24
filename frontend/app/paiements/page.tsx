"use client";

import { useEffect, useState } from "react";

import {
  createPaiement,
  getPaiements,
  getPaiementsByTransaction,
  getPaiementPdfUrl,
} from "@/services/paiements";

import { getTransactions } from "@/services/transactions";


interface Transaction {
  id: number;
  type: string;
  statut: string;
  statutPaiement: string;
  prix?: number | null;
  parcelle?: {
    id: number;
    reference: string;
    numero: string;
  };
  acquereur?: {
    id: number;
    nom: string;
    prenom: string;
  };
}


interface Paiement {
  id: number;
  numeroRecu: string;
  transactionId: number;
  montant: number;
  modePaiement: string;
  reference?: string | null;
  commentaire?: string | null;
  datePaiement: string;
  transaction?: Transaction;
}


export default function PaiementsPage() {

  const [paiements, setPaiements] = useState<Paiement[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [transactionId, setTransactionId] = useState("");

  const [montant, setMontant] = useState("");

  const [modePaiement, setModePaiement] =
    useState("ESPECES");

  const [reference, setReference] = useState("");

  const [commentaire, setCommentaire] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  const [resume, setResume] = useState<any>(null);


  async function chargerDonnees() {

    try {

      setLoading(true);

      setError("");

      const [paiementsData, transactionsData] =
        await Promise.all([
          getPaiements(),
          getTransactions(),
        ]);

      setPaiements(paiementsData);

      setTransactions(transactionsData);

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

    chargerDonnees();

  }, []);


  async function chargerResume(
    id: number,
  ) {

    try {

      const data =
        await getPaiementsByTransaction(id);

      setResume(data);

    } catch (err) {

      console.error(err);

      setResume(null);

    }

  }


  function handleTransactionChange(
    value: string,
  ) {

    setTransactionId(value);

    setResume(null);

    if (value) {

      chargerResume(
        Number(value),
      );

    }

  }


  async function handleSubmit(
    event: React.FormEvent,
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (!transactionId) {

      setError(
        "Veuillez sélectionner une transaction.",
      );

      return;

    }


    if (!montant) {

      setError(
        "Veuillez saisir un montant.",
      );

      return;

    }


    const montantNumber =
      Number(montant);


    if (
      Number.isNaN(montantNumber) ||
      montantNumber <= 0
    ) {

      setError(
        "Le montant doit être supérieur à zéro.",
      );

      return;

    }


    try {

      setSaving(true);


      await createPaiement({

        transactionId:
          Number(transactionId),

        montant:
          montantNumber,

        modePaiement,

        reference:
          reference || undefined,

        commentaire:
          commentaire || undefined,

      });


      setSuccess(
        "Paiement enregistré avec succès.",
      );


      setMontant("");

      setReference("");

      setCommentaire("");

      setResume(null);


      await chargerDonnees();


      await chargerResume(
        Number(transactionId),
      );

    } catch (err: any) {

      console.error(err);

      setError(
        err?.message ||
        "Impossible d'enregistrer le paiement.",
      );

    } finally {

      setSaving(false);

    }

  }


  const transactionSelectionnee =
    transactions.find(
      (transaction) =>
        transaction.id ===
        Number(transactionId),
    );


  const prix =
    resume?.transaction?.prix ??
    transactionSelectionnee?.prix ??
    0;


  const totalPaye =
    resume?.totalPaye ?? 0;


  const resteAPayer =
    resume?.resteAPayer ??
    Math.max(
      prix - totalPaye,
      0,
    );


  function formatMontant(
    valeur: number,
  ) {

    return new Intl.NumberFormat(
      "fr-FR",
    ).format(valeur);

  }


  if (loading) {

    return (

      <div className="p-8">

        <p className="text-slate-500">
          Chargement des paiements...
        </p>

      </div>

    );

  }


  return (

    <div className="space-y-8 p-8">


      {/* EN-TÊTE */}

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Paiements
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Gestion des paiements et des reçus
          des transactions foncières.
        </p>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="
          rounded-lg
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-700
        ">

          {error}

        </div>

      )}


      {success && (

        <div className="
          rounded-lg
          border
          border-green-200
          bg-green-50
          px-4
          py-3
          text-sm
          text-green-700
        ">

          {success}

        </div>

      )}


      {/* FORMULAIRE */}

      <div className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      ">

        <h2 className="
          mb-6
          text-xl
          font-semibold
          text-slate-900
        ">

          Enregistrer un paiement

        </h2>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >


          {/* TRANSACTION */}

          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            ">

              Transaction

            </label>


            <select

              value={transactionId}

              onChange={(event) =>
                handleTransactionChange(
                  event.target.value,
                )
              }

              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-900
              "

            >

              <option value="">
                Sélectionner une transaction
              </option>


              {transactions.map(
                (transaction) => (

                  <option
                    key={transaction.id}
                    value={transaction.id}
                  >

                    #{transaction.id}

                    {" — "}

                    {transaction.type}

                    {" — "}

                    {transaction.parcelle?.reference ??
                      "Parcelle"}

                    {" — "}

                    {transaction.prix
                      ? `${formatMontant(
                          transaction.prix,
                        )} FCFA`
                      : "Prix non défini"}

                  </option>

                ),
              )}

            </select>

          </div>


          {/* RESUME */}

          {transactionId && (

            <div className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            ">


              <div className="
                rounded-lg
                bg-slate-50
                p-4
              ">

                <p className="
                  text-xs
                  text-slate-500
                ">

                  Prix de la transaction

                </p>

                <p className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                ">

                  {formatMontant(prix)}
                  {" "}FCFA

                </p>

              </div>


              <div className="
                rounded-lg
                bg-blue-50
                p-4
              ">

                <p className="
                  text-xs
                  text-blue-600
                ">

                  Total déjà payé

                </p>

                <p className="
                  mt-1
                  text-lg
                  font-bold
                  text-blue-900
                ">

                  {formatMontant(totalPaye)}
                  {" "}FCFA

                </p>

              </div>


              <div className="
                rounded-lg
                bg-orange-50
                p-4
              ">

                <p className="
                  text-xs
                  text-orange-600
                ">

                  Reste à payer

                </p>

                <p className="
                  mt-1
                  text-lg
                  font-bold
                  text-orange-900
                ">

                  {formatMontant(resteAPayer)}
                  {" "}FCFA

                </p>

              </div>


            </div>

          )}


          {/* MONTANT */}

          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            ">

              Montant du paiement

            </label>


            <input

              type="number"

              min="1"

              value={montant}

              onChange={(event) =>
                setMontant(
                  event.target.value,
                )
              }

              placeholder="Ex : 500000"

              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-900
              "

            />

          </div>


          {/* MODE */}

          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            ">

              Mode de paiement

            </label>


            <select

              value={modePaiement}

              onChange={(event) =>
                setModePaiement(
                  event.target.value,
                )
              }

              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-900
              "

            >

              <option value="ESPECES">
                Espèces
              </option>

              <option value="VIREMENT">
                Virement bancaire
              </option>

              <option value="CHEQUE">
                Chèque
              </option>

              <option value="MOBILE_MONEY">
                Mobile Money
              </option>

              <option value="CARTE">
                Carte bancaire
              </option>

            </select>

          </div>


          {/* REFERENCE */}

          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            ">

              Référence

            </label>


            <input

              type="text"

              value={reference}

              onChange={(event) =>
                setReference(
                  event.target.value,
                )
              }

              placeholder="Référence du virement, chèque, etc."

              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-900
              "

            />

          </div>


          {/* COMMENTAIRE */}

          <div>

            <label className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            ">

              Commentaire

            </label>


            <textarea

              value={commentaire}

              onChange={(event) =>
                setCommentaire(
                  event.target.value,
                )
              }

              rows={3}

              placeholder="Commentaire facultatif"

              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-900
              "

            />

          </div>


          {/* BOUTON */}

          <button

            type="submit"

            disabled={saving}

            className="
              w-full
              rounded-lg
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "

          >

            {saving
              ? "Enregistrement..."
              : "Enregistrer le paiement"}

          </button>


        </form>

      </div>


      {/* LISTE */}

      <div>

        <div className="
          mb-4
          flex
          items-center
          justify-between
        ">

          <h2 className="
            text-xl
            font-semibold
            text-slate-900
          ">

            Historique des paiements

          </h2>


          <span className="
            rounded-full
            bg-slate-100
            px-3
            py-1
            text-sm
            text-slate-600
          ">

            {paiements.length} paiement(s)

          </span>

        </div>


        {paiements.length === 0 ? (

          <div className="
            rounded-xl
            border
            border-dashed
            border-slate-300
            bg-white
            p-10
            text-center
          ">

            <p className="text-slate-500">

              Aucun paiement enregistré.

            </p>

          </div>

        ) : (

          <div className="
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
          ">

            <div className="overflow-x-auto">

              <table className="
                min-w-full
                text-sm
              ">

                <thead className="
                  border-b
                  border-slate-200
                  bg-slate-50
                ">

                  <tr>

                    <th className="
                      px-5
                      py-4
                      text-left
                      font-semibold
                    ">

                      Reçu

                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      font-semibold
                    ">

                      Transaction

                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      font-semibold
                    ">

                      Montant

                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      font-semibold
                    ">

                      Mode

                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      font-semibold
                    ">

                      Date

                    </th>

                    <th className="
                      px-5
                      py-4
                      text-right
                      font-semibold
                    ">

                      Action

                    </th>

                  </tr>

                </thead>


                <tbody>

                  {paiements.map(
                    (paiement) => (

                      <tr
                        key={paiement.id}
                        className="
                          border-b
                          border-slate-100
                          last:border-0
                        "
                      >

                        <td className="
                          px-5
                          py-4
                          font-medium
                        ">

                          {paiement.numeroRecu}

                        </td>


                        <td className="
                          px-5
                          py-4
                        ">

                          #{paiement.transactionId}

                        </td>


                        <td className="
                          px-5
                          py-4
                          font-semibold
                        ">

                          {formatMontant(
                            paiement.montant,
                          )}

                          {" "}FCFA

                        </td>


                        <td className="
                          px-5
                          py-4
                        ">

                          {paiement.modePaiement}

                        </td>


                        <td className="
                          px-5
                          py-4
                        ">

                          {new Date(
                            paiement.datePaiement,
                          ).toLocaleDateString(
                            "fr-FR",
                          )}

                        </td>


                        <td className="
                          px-5
                          py-4
                          text-right
                        ">

                          <a

                            href={
                              getPaiementPdfUrl(
                                paiement.id,
                              )
                            }

                            target="_blank"

                            rel="noopener noreferrer"

                            className="
                              inline-flex
                              rounded-lg
                              bg-slate-900
                              px-3
                              py-2
                              text-xs
                              font-medium
                              text-white
                              hover:bg-slate-700
                            "

                          >

                            Reçu PDF

                          </a>

                        </td>

                      </tr>

                    ),
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>


    </div>

  );

}
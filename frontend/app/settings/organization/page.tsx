"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

import {
  getOrganization,
  updateOrganization,
} from "@/services/organization";


export default function OrganizationSettingsPage() {


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [telephone, setTelephone] =
    useState("");

  const [adresse, setAdresse] =
    useState("");

  const [ville, setVille] =
    useState("");

  const [pays, setPays] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");



  useEffect(() => {

    async function loadOrganization() {

      try {

        const organization =
          await getOrganization();



        setName(
          organization.name ?? "",
        );

        setEmail(
          organization.email ?? "",
        );

        setTelephone(
          organization.telephone ?? "",
        );

        setAdresse(
          organization.adresse ?? "",
        );

        setVille(
          organization.ville ?? "",
        );

        setPays(
          organization.pays ?? "",
        );


      } catch (error) {

        console.error(
          "Erreur chargement organisation :",
          error,
        );

        setError(
          "Impossible de charger les informations de l'organisation.",
        );


      } finally {

        setLoading(false);

      }

    }



    loadOrganization();

  }, []);




  async function handleSubmit(
    event: FormEvent,
  ) {

    event.preventDefault();

    setSaving(true);

    setMessage("");

    setError("");



    try {

      await updateOrganization({

        name,

        email: email || undefined,

        telephone:
          telephone || undefined,

        adresse:
          adresse || undefined,

        ville:
          ville || undefined,

        pays:
          pays || undefined,

      });



      setMessage(
        "Les informations de l'organisation ont été enregistrées.",
      );


    } catch (error) {

      console.error(
        "Erreur enregistrement organisation :",
        error,
      );

      setError(
        "Impossible d'enregistrer les informations.",
      );


    } finally {

      setSaving(false);

    }

  }



  if (loading) {

    return (

      <div className="space-y-8">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">

            Organisation

          </h1>

          <p className="mt-2 text-slate-500">

            Chargement des informations...

          </p>

        </div>

      </div>

    );

  }



  return (

    <div className="space-y-8">


      <div>

        <h1 className="text-3xl font-bold text-slate-900">

          Organisation

        </h1>


        <p className="mt-2 text-slate-500">

          Configurez les informations générales de votre
          organisation.

        </p>

      </div>



      <div className="max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">


        <div className="border-b border-slate-200 p-6">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">

              <Building2 size={21} />

            </div>


            <div>

              <h2 className="text-lg font-semibold text-slate-900">

                Informations générales

              </h2>


              <p className="text-sm text-slate-500">

                Ces informations pourront être utilisées
                sur les documents et contrats NIANI'S IMO.

              </p>

            </div>

          </div>

        </div>



        <form
          onSubmit={handleSubmit}
          className="p-6"
        >


          <div className="grid gap-6 md:grid-cols-2">


            <div className="md:col-span-2">

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Nom de l'organisation

              </label>


              <div className="relative">

                <Building2
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                  placeholder="Nom de l'organisation"
                />

              </div>

            </div>



            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Adresse e-mail

              </label>


              <div className="relative">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                  placeholder="contact@organisation.com"
                />

              </div>

            </div>



            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Téléphone

              </label>


              <div className="relative">

                <Phone
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  type="tel"
                  value={telephone}
                  onChange={(event) =>
                    setTelephone(event.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                  placeholder="+242 ..."
                />

              </div>

            </div>



            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Ville

              </label>


              <div className="relative">

                <MapPin
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />


                <input
                  type="text"
                  value={ville}
                  onChange={(event) =>
                    setVille(event.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    py-3
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                  placeholder="Pointe-Noire"
                />

              </div>

            </div>



            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Pays

              </label>


              <input
                type="text"
                value={pays}
                onChange={(event) =>
                  setPays(event.target.value)
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                placeholder="Congo"
              />

            </div>



            <div className="md:col-span-2">

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              ">

                Adresse

              </label>


              <textarea
                value={adresse}
                onChange={(event) =>
                  setAdresse(event.target.value)
                }
                rows={4}
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                "
                placeholder="Adresse de l'organisation"
              />

            </div>


          </div>



          {message && (

            <div className="
              mt-6
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-3
              text-sm
              text-emerald-700
            ">

              {message}

            </div>

          )}



          {error && (

            <div className="
              mt-6
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



          <div className="
            mt-8
            flex
            justify-end
            border-t
            border-slate-200
            pt-6
          ">

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-5
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <Save size={17} />

              {saving
                ? "Enregistrement..."
                : "Enregistrer"}

            </button>

          </div>


        </form>

      </div>

    </div>

  );

}
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";

type Role =
  | "USER"
  | "DIRECTEUR"
  | "CHEF_PROJET"
  | "COMMERCIAL"
  | "GEOMETRE";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

/**
 * Toutes les requêtes utilisateurs passent
 * par Next.js :
 *
 * navigateur
 *    ↓
 * /api/users
 *    ↓
 * cookie JWT
 *    ↓
 * NestJS /users
 */
async function usersRequest(
  endpoint: string,
  options?: RequestInit,
) {
  const response = await fetch(
    `/api/users${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Une erreur est survenue.",
    );
  }

  return data;
}

const roles: {
  value: Role;
  label: string;
}[] = [
  {
    value: "USER",
    label: "Utilisateur",
  },
  {
    value: "DIRECTEUR",
    label: "Directeur",
  },
  {
    value: "CHEF_PROJET",
    label: "Chef de projet",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
  },
  {
    value: "GEOMETRE",
    label: "Géomètre",
  },
];

function roleLabel(role: Role) {
  const found = roles.find(
    (item) => item.value === role,
  );

  return found?.label || role;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [form, setForm] =
    useState<UserForm>({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });

  /**
   * Charger les utilisateurs
   */
  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await usersRequest("");

      /**
       * Selon la réponse de ton backend,
       * data peut être directement un tableau
       * ou contenir un champ users.
       */
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (
        Array.isArray(data?.users)
      ) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(
        "Erreur chargement utilisateurs :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les utilisateurs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Ouvrir le formulaire d'ajout
   */
  function openCreateForm() {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });

    setShowForm(true);
    setError("");
  }

  /**
   * Ouvrir le formulaire de modification
   */
  function openEditForm(user: User) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setShowForm(true);
    setError("");
  }

  /**
   * Fermer le formulaire
   */
  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingUser(null);
  }

  /**
   * Modifier les champs
   */
  function updateField(
    field: keyof UserForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /**
   * Enregistrer utilisateur
   */
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      /**
       * MODIFICATION
       */
      if (editingUser) {
        const body: {
          name: string;
          email: string;
          role: Role;
          password?: string;
        } = {
          name: form.name,
          email: form.email,
          role: form.role,
        };

        /**
         * Le mot de passe est facultatif
         * lors d'une modification.
         */
        if (form.password.trim()) {
          body.password =
            form.password;
        }

        await usersRequest(
          `/${editingUser.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        );
      }

      /**
       * CREATION
       */
      else {
        if (!form.password.trim()) {
          throw new Error(
            "Le mot de passe est obligatoire.",
          );
        }

        await usersRequest("", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        });
      }

      closeForm();

      await loadUsers();
    } catch (error) {
      console.error(
        "Erreur enregistrement utilisateur :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer l'utilisateur.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Supprimer utilisateur
   */
  async function handleDelete(
    user: User,
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer ${user.name} ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await usersRequest(
        `/${user.id}`,
        {
          method: "DELETE",
        },
      );

      await loadUsers();
    } catch (error) {
      console.error(
        "Erreur suppression utilisateur :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur.",
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* EN-TÊTE */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Users size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Utilisateurs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gérez les comptes et les rôles
                des utilisateurs de NIANI'S IMO.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-slate-900
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-slate-800
          "
        >
          <Plus size={18} />

          Ajouter un utilisateur
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* TABLEAU */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-sm text-slate-400">
              Chargement des utilisateurs...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <Users
              size={40}
              className="mb-4 text-slate-300"
            />

            <h2 className="text-lg font-semibold text-slate-700">
              Aucun utilisateur
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Aucun compte utilisateur n'a
              été trouvé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Nom
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rôle
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {user.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {roleLabel(
                            user.role,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                user,
                              )
                            }
                            className="
                              rounded-lg
                              p-2
                              text-slate-500
                              transition
                              hover:bg-slate-100
                              hover:text-slate-900
                            "
                            title="Modifier"
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                user,
                              )
                            }
                            className="
                              rounded-lg
                              p-2
                              text-slate-500
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                            "
                            title="Supprimer"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingUser
                    ? "Modifier l'utilisateur"
                    : "Ajouter un utilisateur"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Modifiez les informations du compte."
                    : "Créez un nouveau compte NIANI'S IMO."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* NOM */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nom
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none
                    focus:border-slate-900
                    focus:ring-1
                    focus:ring-slate-900
                  "
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none
                    focus:border-slate-900
                    focus:ring-1
                    focus:ring-slate-900
                  "
                />
              </div>

              {/* MOT DE PASSE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mot de passe
                  {editingUser && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      laisser vide pour ne pas
                      modifier
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value,
                    )
                  }
                  required={!editingUser}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none
                    focus:border-slate-900
                    focus:ring-1
                    focus:ring-slate-900
                  "
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rôle
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    updateField(
                      "role",
                      event.target.value,
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    outline-none
                    focus:border-slate-900
                    focus:ring-1
                    focus:ring-slate-900
                  "
                >
                  {roles.map(
                    (role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    rounded-lg
                    bg-slate-900
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Enregistrement..."
                    : editingUser
                      ? "Modifier"
                      : "Créer l'utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
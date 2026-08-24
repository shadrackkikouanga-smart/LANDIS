
export type Role =
  | "DIRECTEUR"
  | "CHEF_PROJET"
  | "COMMERCIAL"
  | "GEOMETRE";

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
};

export async function getCurrentUser(): Promise<
  CurrentUser | null
> {
  try {
    const response = await fetch(
      "/api/auth/me",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const user =
      await response.json();

    if (
      !user?.id ||
      !user?.email ||
      !user?.role
    ) {
      return null;
    }

    return user as CurrentUser;
  } catch (error) {
    console.error(
      "Erreur récupération utilisateur :",
      error,
    );

    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  /*
   * Le cookie token est HTTP-only.
   * Il ne peut donc pas être supprimé
   * directement avec JavaScript.
   *
   * La suppression sera faite par
   * la route /api/auth/logout.
   */
}


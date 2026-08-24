export type UserRole =
  | "DIRECTEUR"
  | "CHEF_PROJET"
  | "COMMERCIAL"
  | "GEOMETRE";

export const rolePermissions: Record<UserRole, string[]> = {
  DIRECTEUR: [
    "/dashboard",
    "/projects",
    "/terrains",
    "/blocs",
    "/parcelles",
    "/proprietaires",
    "/acquereurs",
    "/transactions",
    "/paiements",
    "/documents",
    "/settings",
  ],

  CHEF_PROJET: [
    "/dashboard",
    "/projects",
    "/terrains",
    "/blocs",
    "/parcelles",
  ],

  COMMERCIAL: [
    "/dashboard",
    "/acquereurs",
    "/transactions",
    "/paiements",
    "/documents",
  ],

  GEOMETRE: [
    "/dashboard",
    "/terrains",
    "/blocs",
    "/parcelles",
  ],
};

export function hasPermission(
  role: string,
  pathname: string,
): boolean {
  const permissions =
    rolePermissions[role as UserRole];

  if (!permissions) {
    return false;
  }

  return permissions.some(
    (permission) =>
      pathname === permission ||
      pathname.startsWith(`${permission}/`),
  );
}
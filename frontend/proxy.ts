import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  DIRECTEUR: [
    "/dashboard",
    "/projects",
    "/terrains",
    "/sections",
    "/familles-foncieres",
    "/blocs",
    "/parcelles",
    "/voies",
    "/recensements",
    "/proprietaires",
    "/acquereurs",
    "/transactions",
    "/paiements",
    "/documents",
    "/carte",
    "/settings",
  ],

  CHEF_PROJET: [
    "/dashboard",
    "/projects",
    "/terrains",
    "/sections",
    "/familles-foncieres",
    "/blocs",
    "/parcelles",
    "/voies",
    "/recensements",
    "/carte",
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
    "/sections",
    "/familles-foncieres",
    "/blocs",
    "/parcelles",
    "/voies",
    "/recensements",
  ],
};

function isAllowedRoute(
  pathname: string,
  allowedRoutes: string[],
) {
  return allowedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Ressources Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("token")?.value;

  // Pas connecté
  if (!token) {
    const loginUrl =
      new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirect",
      pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  const role =
    request.cookies.get("role")?.value;

  // Pas de rôle
  if (!role) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  const allowedRoutes =
    ROLE_ROUTES[role];

  // Rôle inconnu
  if (!allowedRoutes) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  // Route interdite
  if (
    !isAllowedRoute(
      pathname,
      allowedRoutes,
    )
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
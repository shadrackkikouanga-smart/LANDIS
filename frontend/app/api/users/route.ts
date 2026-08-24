import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/**
 * GET /api/users
 *
 * Récupère tous les utilisateurs
 * en transmettant le JWT présent
 * dans le cookie httpOnly.
 */
export async function GET(
  request: NextRequest,
) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Non authentifié",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      `${API_URL}/users`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        cache: "no-store",
      },
    );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "Erreur proxy GET /api/users :",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Impossible de contacter le serveur.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/users
 *
 * Création d'un utilisateur.
 */
export async function POST(
  request: NextRequest,
) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Non authentifié",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const response = await fetch(
      `${API_URL}/users`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),
      },
    );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  } catch (error) {
    console.error(
      "Erreur proxy POST /api/users :",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Impossible de contacter le serveur.",
      },
      {
        status: 500,
      },
    );
  }
}
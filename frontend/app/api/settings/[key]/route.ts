import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type RouteContext = {
  params: Promise<{
    key: string;
  }>;
};

/**
 * GET /api/settings/:key
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
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

    const { key } =
      await context.params;

    const response = await fetch(
      `${API_URL}/settings/${encodeURIComponent(
        key,
      )}`,
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

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Erreur GET /api/settings/:key :",
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
 * PATCH /api/settings/:key
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
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

    const { key } =
      await context.params;

    const body =
      await request.json();

    const response = await fetch(
      `${API_URL}/settings/${encodeURIComponent(
        key,
      )}`,
      {
        method: "PATCH",

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

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      "Erreur PATCH /api/settings/:key :",
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
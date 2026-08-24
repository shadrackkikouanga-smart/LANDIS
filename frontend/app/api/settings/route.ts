import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

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
      `${API_URL}/settings`,
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
      "Erreur GET /api/settings :",
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
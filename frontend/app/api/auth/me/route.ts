
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
};

export async function GET(
  request: NextRequest,
) {
  try {
    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Utilisateur non connecté",
        },
        {
          status: 401,
        },
      );
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET est absent du frontend.",
      );

      return NextResponse.json(
        {
          message:
            "Configuration serveur incorrecte",
        },
        {
          status: 500,
        },
      );
    }

    const secretKey =
      new TextEncoder().encode(secret);

    const { payload } =
      await jwtVerify<JwtPayload>(
        token,
        secretKey,
      );

    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  } catch (error) {
    console.error(
      "Erreur vérification session :",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Session invalide ou expirée",
      },
      {
        status: 401,
      },
    );
  }
}


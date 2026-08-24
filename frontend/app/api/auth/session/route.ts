import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = body.token;

    if (!token) {
      return NextResponse.json(
        {
          message: "Token manquant",
        },
        {
          status: 400,
        },
      );
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return NextResponse.json(
        {
          message: "Token JWT invalide",
        },
        {
          status: 400,
        },
      );
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString(),
    );

    const role = payload.role;

    if (!role) {
      return NextResponse.json(
        {
          message: "Rôle absent du token",
        },
        {
          status: 400,
        },
      );
    }

    const response = NextResponse.json({
      success: true,
      role,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    response.cookies.set({
      name: "role",
      value: role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message: "Impossible de créer la session",
      },
      {
        status: 500,
      },
    );
  }
}
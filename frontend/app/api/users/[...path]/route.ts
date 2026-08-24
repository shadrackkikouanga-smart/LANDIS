import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

async function proxyRequest(
  request: NextRequest,
  path: string[],
) {
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

  const backendUrl =
    `${API_URL}/users/${path.join("/")}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body =
    request.method === "GET" ||
    request.method === "DELETE"
      ? undefined
      : await request.text();

  const response = await fetch(
    backendUrl,
    {
      method: request.method,
      headers,
      body,
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
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  const { path } =
    await context.params;

  return proxyRequest(
    request,
    path,
  );
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  const { path } =
    await context.params;

  return proxyRequest(
    request,
    path,
  );
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  const { path } =
    await context.params;

  return proxyRequest(
    request,
    path,
  );
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  const { path } =
    await context.params;

  return proxyRequest(
    request,
    path,
  );
}
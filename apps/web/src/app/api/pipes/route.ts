import { NextRequest, NextResponse } from "next/server";

const TINYBIRD_API_URL = "https://api.tinybird.co/v0/pipes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const pipeName = searchParams.get("pipe");

  if (!token || !pipeName) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const url = new URL(`${TINYBIRD_API_URL}/${pipeName}.json`);

  // Forward all query parameters except token and pipe
  searchParams.forEach((value, key) => {
    if (key !== "token" && key !== "pipe") {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data from Tinybird: " + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { token, pipe, ...params } = await request.json();

  if (!token || !pipe) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const url = new URL(`${TINYBIRD_API_URL}/${pipe}.json`);

  // Add all params as query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data from Tinybird: " + error },
      { status: 500 }
    );
  }
}
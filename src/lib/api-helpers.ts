import { NextResponse } from "next/server";

export function jsonResponse(
  data: unknown,
  status = 200,
  headers?: HeadersInit,
) {
  return NextResponse.json(data, { status, headers });
}

export function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function cachedResponse(
  data: unknown,
  maxAge: number,
  staleWhileRevalidate: number,
) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}

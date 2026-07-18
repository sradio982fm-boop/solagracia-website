import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge proxy scaffold (Next.js 16). Add auth session refresh / rate limits here.
 */
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};

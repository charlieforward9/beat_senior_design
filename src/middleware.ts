import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log(`PATHNAME: ${request.nextUrl.pathname}`);
  if (request.nextUrl.pathname === "/auth") {
    return NextResponse.rewrite(new URL("/auth/sign-in", request.url));
  }
  const response = NextResponse.next();

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  if (authenticated) {
    console.log(response);
    return response;
  }

  return NextResponse.redirect(new URL("/auth", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

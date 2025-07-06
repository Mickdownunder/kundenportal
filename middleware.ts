import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Diese Funktion wird nach erfolgreicher Autorisierung aufgerufen.
    // Aktuell lassen wir die Anfrage einfach durch.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Regel 1: Für den Admin-Bereich...
        if (pathname.startsWith("/admin")) {
          // ...muss der Benutzer die Rolle "admin" haben.
          return token?.role === "admin";
        }

        // Regel 2: Für alle anderen geschützten Seiten reicht ein normaler Login.
        return !!token;
      },
    },
    pages: {
      // Wenn ein unautorisierter Zugriff auf /admin passiert, wird hierhin umgeleitet.
      signIn: "/admin/login", 
    },
  }
);

// Dieser Teil legt fest, welche Seiten überhaupt von der Middleware geprüft werden.
export const config = {
  matcher: [
    "/portal/:path*",
    "/welcome/:path*",
    "/admin/:path*",
    // Die Login-Seiten selbst werden NICHT geschützt.
  ],
};

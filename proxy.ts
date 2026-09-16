import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION, leerSesion } from "@/lib/sesion";

// rutas que solo puede ver un cliente logueado, lo demas es de admin
const RUTAS_CLIENTE = ["/mi-cuenta"];

// rutas publicas: el usuario final de una tienda no tiene cuenta en el courier
const RUTAS_PUBLICAS = ["/rastreo"];

function empiezaCon(pathname: string, rutas: string[]) {
  return rutas.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesion = await leerSesion(request.cookies.get(COOKIE_SESION)?.value);
  const inicio = sesion?.rol === "cliente" ? "/mi-cuenta" : "/";

  if (pathname === "/login") {
    // si ya tiene sesion no tiene sentido mostrarle el login
    if (sesion) return NextResponse.redirect(new URL(inicio, request.url));
    return NextResponse.next();
  }

  if (empiezaCon(pathname, RUTAS_PUBLICAS)) {
    return NextResponse.next();
  }

  if (!sesion) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    // si la cookie estaba vencida o alterada se limpia
    if (request.cookies.has(COOKIE_SESION)) res.cookies.delete(COOKIE_SESION);
    return res;
  }

  const esRutaCliente = empiezaCon(pathname, RUTAS_CLIENTE);
  if (sesion.rol === "cliente" && !esRutaCliente) {
    return NextResponse.redirect(new URL("/mi-cuenta", request.url));
  }
  if (sesion.rol === "admin" && esRutaCliente) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// /api queda afuera porque las tiendas consumen el webservice sin sesion
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

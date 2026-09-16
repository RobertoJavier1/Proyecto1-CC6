import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESION,
  DURACION_SESION,
  firmarSesion,
  leerSesion,
  type Sesion,
} from "./sesion";

export async function getSesion() {
  const store = await cookies();
  return leerSesion(store.get(COOKIE_SESION)?.value);
}

export async function iniciarSesion(datos: Omit<Sesion, "exp">) {
  const store = await cookies();
  store.set(COOKIE_SESION, await firmarSesion(datos), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION,
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE_SESION);
}

// el proxy ya bloquea las rutas, pero las server actions se validan otra vez
export async function requireAdmin() {
  const sesion = await getSesion();
  if (!sesion || sesion.rol !== "admin") redirect("/login");
  return sesion;
}

export async function requireCliente() {
  const sesion = await getSesion();
  if (!sesion || sesion.rol !== "cliente") redirect("/login");
  return sesion;
}

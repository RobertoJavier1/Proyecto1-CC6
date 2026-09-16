// sesion guardada en una cookie firmada con HMAC, sin tabla extra en la bd.
// usa Web Crypto para que funcione igual en proxy.ts y en el servidor

export type Rol = "admin" | "cliente";

export type Sesion = {
  rol: Rol;
  id: number;
  nombre: string;
  exp: number; // epoch en segundos
};

export const COOKIE_SESION = "sesion";
export const DURACION_SESION = 60 * 60 * 8; // 8 horas

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Falta SESSION_SECRET en el .env");
  }
  return secret ?? "secreto-de-desarrollo";
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(texto: string) {
  const b64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function firmarSesion(datos: Omit<Sesion, "exp">) {
  const sesion: Sesion = {
    ...datos,
    exp: Math.floor(Date.now() / 1000) + DURACION_SESION,
  };
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(sesion)));
  const firma = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(firma))}`;
}

// devuelve null si la cookie no existe, esta alterada o ya vencio
export async function leerSesion(token: string | undefined) {
  if (!token) return null;
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  try {
    const valida = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(firma),
      new TextEncoder().encode(payload),
    );
    if (!valida) return null;

    const sesion = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as Sesion;
    if (sesion.exp < Math.floor(Date.now() / 1000)) return null;
    if (sesion.rol !== "admin" && sesion.rol !== "cliente") return null;
    return sesion;
  } catch {
    return null;
  }
}

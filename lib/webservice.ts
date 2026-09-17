// Utilidades compartidas por los 3 endpoints del WebService (API-REST) del
// courier: /api/consulta, /api/envio y /api/status.
//
// El enunciado pide que las llamadas devuelvan XML o JSON según el parámetro
// &formato=. Estas funciones arman esa respuesta a partir de un objeto plano
// { tag: valor } (un solo nivel, que es todo lo que piden los formatos del
// proyecto) y regresan directamente un Response de Next.js con el
// content-type correcto.

export type Formato = "xml" | "json";

// Acepta "xml"/"json" en cualquier combinación de mayúsculas/minúsculas.
// Si no viene o viene con otro valor, se usa JSON por default.
export function parseFormato(valor: string | null): Formato {
  const v = (valor ?? "").trim().toLowerCase();
  return v === "xml" ? "xml" : "json";
}

// Escapa los caracteres especiales de XML para no romper el documento
// si un nombre, dirección, etc. trae &, <, > o comillas.
function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// raiz: nombre del tag principal, p. ej. "consultaprecio", "envio", "orden".
// datos: pares tag/valor de primer nivel, en el orden en que deben salir.
function construirXml(raiz: string, datos: Record<string, string | number>) {
  const campos = Object.entries(datos)
    .map(([tag, valor]) => `<${tag}>${escaparXml(String(valor))}</${tag}>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><${raiz}>${campos}</${raiz}>`;
}

function construirJson(raiz: string, datos: Record<string, string | number>) {
  return JSON.stringify({ [raiz]: datos });
}

// Arma la respuesta final (Response) en el formato pedido.
export function respuestaWebservice(
  raiz: string,
  datos: Record<string, string | number>,
  formato: Formato,
  status = 200,
) {
  if (formato === "xml") {
    return new Response(construirXml(raiz, datos), {
      status,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
  return new Response(construirJson(raiz, datos), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

// Identificador del courier (15 caracteres según el enunciado). Se define en
// .env.local con COURIER_ID; si no está configurada usamos un valor fijo
// para que el proyecto no truene en desarrollo.
export function getCourierId() {
  return process.env.COURIER_ID ?? "ENTREGASRAPI15";
}

// Ciudad de origen fija del courier (ya se usaba en app/ordenes/actions.ts).
export function getOrigenCourier() {
  return process.env.ORIGEN_COURIER ?? null;
}

export const REGEX_CODIGO_CIUDAD = /^.{5}$/;

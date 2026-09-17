// WebService (API-REST) — Consulta de costo de envío.
//
// GET /api/consulta?destino=_____&formato=xml|json
//
// Lo llama una tienda virtual externa para saber cuánto cuesta enviar a una
// ciudad antes de contratar el envío. No requiere login: es el endpoint
// público que consumen los otros sitios del proyecto integrado.
import { getTarifa } from "@/lib/tarifas";
import {
  getCourierId,
  getOrigenCourier,
  parseFormato,
  respuestaWebservice,
  REGEX_CODIGO_CIUDAD,
} from "@/lib/webservice";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formato = parseFormato(searchParams.get("formato"));
  const destino = (searchParams.get("destino") ?? "").trim().toUpperCase();
  const courier = getCourierId();

  // destino invalido -> tratamos como sin cobertura en vez de tronar,
  // asi la tienda que llama siempre recibe una respuesta con el formato pedido
  if (!REGEX_CODIGO_CIUDAD.test(destino)) {
    return respuestaWebservice(
      "consultaprecio",
      { courrier: courier, destino, cobertura: "FALSE", costo: 0 },
      formato,
      400,
    );
  }

  const origen = getOrigenCourier();
  if (!origen) {
    // el courier no tiene configurada su ciudad base (ORIGEN_COURIER en .env.local)
    return respuestaWebservice(
      "consultaprecio",
      { courrier: courier, destino, cobertura: "FALSE", costo: 0 },
      formato,
      500,
    );
  }

  const tarifa = await getTarifa(origen, destino);

  return respuestaWebservice(
    "consultaprecio",
    {
      courrier: courier,
      destino,
      cobertura: tarifa ? "TRUE" : "FALSE",
      costo: tarifa ? tarifa.precio : 0,
    },
    formato,
  );
}

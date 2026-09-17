// WebService (API-REST) — Consulta de estatus de una orden.
//
// GET /api/status?orden=___&tienda=___&formato=xml|json
//
// "orden" es el numero de orden DE LA TIENDA (num_orden_tienda) y "tienda" es
// su id registrado, igual que en /api/envio: juntos identifican una orden de
// forma unica (ver UNIQUE (Id_tienda, Num_orden_tienda) en el schema).
import { getOrdenPorTienda } from "@/lib/ordenes";
import { getCourierId, parseFormato, respuestaWebservice } from "@/lib/webservice";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formato = parseFormato(searchParams.get("formato"));
  const courier = getCourierId();

  const orden = (searchParams.get("orden") ?? "").trim();
  const tienda = (searchParams.get("tienda") ?? "").trim();

  if (!orden || !tienda) {
    return respuestaWebservice(
      "orden",
      { courrier: courier, orden, status: "DENEGADO: faltan parametros" },
      formato,
      400,
    );
  }

  const encontrada = await getOrdenPorTienda(tienda, orden);

  if (!encontrada) {
    return respuestaWebservice(
      "orden",
      { courrier: courier, orden, status: "DENEGADO: orden no encontrada" },
      formato,
      404,
    );
  }

  return respuestaWebservice(
    "orden",
    { courrier: courier, orden, status: encontrada.estado_nombre },
    formato,
  );
}

// WebService (API-REST) — Solicitud de envío.
//
// GET /api/envio?orden=___&destinatario=___&destino=___&direccion=___&tienda=___&formato=xml|json
//
// Lo llama la tienda virtual externa cuando el cliente ya pagó y hay que
// contratar el envío. "orden" es el numero de orden DE LA TIENDA (no el
// nuestro), "tienda" es el id con el que esa tienda esta registrada en nuestra
// pantalla /tiendas, y "destinatario" es solo el nombre de quien recibe.
//
// El enunciado no define un formato de respuesta especifico para este
// endpoint (solo lo define para autorizacion, consultaprecio y status), asi
// que devolvemos el mismo estilo que /api/status para que la tienda pueda
// confirmar de una vez que la orden quedo creada y en que estado.
import { getTienda } from "@/lib/tiendas";
import { getTarifa } from "@/lib/tarifas";
import { createDestinatario } from "@/lib/destinatarios";
import { createOrdenTienda, getOrdenPorTienda } from "@/lib/ordenes";
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
  const courier = getCourierId();

  const orden = (searchParams.get("orden") ?? "").trim();
  const destinatario = (searchParams.get("destinatario") ?? "").trim();
  const destino = (searchParams.get("destino") ?? "").trim().toUpperCase();
  const direccion = (searchParams.get("direccion") ?? "").trim();
  const tienda = (searchParams.get("tienda") ?? "").trim();

  const responder = (status: string, codigoHttp: number) =>
    respuestaWebservice("envio", { courrier: courier, orden, status: status }, formato, codigoHttp);

  if (!orden || !destinatario || !destino || !direccion || !tienda) {
    return responder("DENEGADO: faltan parametros", 400);
  }
  if (!REGEX_CODIGO_CIUDAD.test(destino)) {
    return responder("DENEGADO: destino invalido", 400);
  }

  // la tienda debe existir ya en nuestra tabla Tiendas (se registra a mano
  // desde la pantalla /tiendas antes de poder mandarnos ordenes)
  const tiendaExiste = await getTienda(tienda);
  if (!tiendaExiste) {
    return responder("DENEGADO: tienda no registrada", 404);
  }

  // si esa tienda ya nos habia mandado esa misma orden, no la duplicamos:
  // regresamos el estado actual (idempotente ante reintentos de la tienda)
  const existente = await getOrdenPorTienda(tienda, orden);
  if (existente) {
    return responder(existente.estado_nombre, 200);
  }

  const origen = getOrigenCourier();
  if (!origen) {
    return responder("DENEGADO: courier sin configurar", 500);
  }

  const tarifa = await getTarifa(origen, destino);
  if (!tarifa) {
    return responder("DENEGADO: sin cobertura a ese destino", 200);
  }

  try {
    const id_destinatario = await createDestinatario(destinatario);
    await createOrdenTienda({
      id_tienda: tienda,
      num_orden_tienda: orden,
      id_destinatario,
      direccion_entrega: direccion,
      codigo_origen: origen,
      codigo_destino: destino,
      costo_envio: tarifa.precio,
    });
  } catch {
    return responder("DENEGADO: error al crear la orden", 500);
  }

  // toda orden nueva nace en el estado 1 = "Orden nueva"
  return responder("Orden nueva", 200);
}

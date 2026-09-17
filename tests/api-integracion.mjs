// Pruebas de integración de los 3 endpoints del WebService.
// Llama al servidor REAL (necesita "npm run dev" corriendo en otra terminal)
// y valida las respuestas contra la BD real, usando los datos que siembra
// tests/seed-integracion.mjs.
//
// Uso (con el servidor ya corriendo en otra terminal):
//   node --env-file=.env.local tests/seed-integracion.mjs
//   node --env-file=.env.local tests/api-integracion.mjs

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// mismos datos que siembra tests/seed-integracion.mjs
const DATOS_PRUEBA = {
  destino: "TST01",
  tienda: "tienda-prueba",
  precio: "50.00",
};
const ORDEN_PRUEBA = `TEST-${Date.now()}`; // única en cada corrida, evita chocar con corridas viejas

let pasadas = 0;
let falladas = 0;

async function assert(nombre, condicion, detalle = "") {
  if (condicion) {
    pasadas++;
    console.log(`OK   - ${nombre}`);
  } else {
    falladas++;
    console.log(`FAIL - ${nombre}${detalle ? " -> " + detalle : ""}`);
  }
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const texto = await res.text();
  let cuerpo;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = texto; // era xml, lo dejamos como texto crudo
  }
  return { status: res.status, contentType: res.headers.get("content-type") ?? "", cuerpo };
}

async function main() {
  console.log(`Probando contra ${BASE_URL} ...\n`);

  // ---------- /api/consulta ----------
  {
    const r = await get(`/api/consulta?destino=${DATOS_PRUEBA.destino}&formato=json`);
    await assert("consulta: destino con cobertura -> 200", r.status === 200, r.status);
    await assert("consulta: cobertura TRUE", r.cuerpo?.consultaprecio?.cobertura === "TRUE", JSON.stringify(r.cuerpo));
    await assert(
      "consulta: costo correcto",
      Number(r.cuerpo?.consultaprecio?.costo) === Number(DATOS_PRUEBA.precio),
      r.cuerpo?.consultaprecio?.costo,
    );
  }
  {
    const r = await get(`/api/consulta?destino=ZZZZZ&formato=json`);
    await assert("consulta: destino sin tarifa -> cobertura FALSE", r.cuerpo?.consultaprecio?.cobertura === "FALSE", JSON.stringify(r.cuerpo));
  }
  {
    const r = await get(`/api/consulta?destino=${DATOS_PRUEBA.destino}&formato=xml`);
    await assert("consulta: formato xml -> content-type xml", r.contentType.includes("xml"), r.contentType);
    await assert("consulta: formato xml -> trae <cobertura>TRUE</cobertura>", typeof r.cuerpo === "string" && r.cuerpo.includes("<cobertura>TRUE</cobertura>"), r.cuerpo);
  }

  // ---------- /api/envio ----------
  {
    const qs = new URLSearchParams({
      orden: ORDEN_PRUEBA,
      destinatario: "Juan Prueba",
      destino: DATOS_PRUEBA.destino,
      direccion: "Calle Falsa 123",
      tienda: DATOS_PRUEBA.tienda,
      formato: "json",
    });
    const r = await get(`/api/envio?${qs}`);
    await assert("envio: orden nueva -> 200", r.status === 200, r.status);
    await assert("envio: status = Orden nueva", r.cuerpo?.envio?.status === "Orden nueva", JSON.stringify(r.cuerpo));
  }
  {
    // repetir la MISMA orden no debe tronar: debe regresar el estado actual
    const qs = new URLSearchParams({
      orden: ORDEN_PRUEBA,
      destinatario: "Juan Prueba",
      destino: DATOS_PRUEBA.destino,
      direccion: "Calle Falsa 123",
      tienda: DATOS_PRUEBA.tienda,
      formato: "json",
    });
    const r = await get(`/api/envio?${qs}`);
    await assert("envio: reintentar misma orden -> 200 (idempotente)", r.status === 200, r.status);
  }
  {
    const qs = new URLSearchParams({
      orden: "orden-x",
      destinatario: "Alguien",
      destino: DATOS_PRUEBA.destino,
      direccion: "Calle Falsa 123",
      tienda: "tienda-que-no-existe",
      formato: "json",
    });
    const r = await get(`/api/envio?${qs}`);
    await assert("envio: tienda no registrada -> 404", r.status === 404, r.status);
    await assert(
      "envio: tienda no registrada -> mensaje correcto",
      r.cuerpo?.envio?.status?.includes("tienda no registrada"),
      JSON.stringify(r.cuerpo),
    );
  }

  // ---------- /api/status ----------
  {
    const r = await get(`/api/status?orden=${ORDEN_PRUEBA}&tienda=${DATOS_PRUEBA.tienda}&formato=json`);
    await assert("status: orden encontrada -> 200", r.status === 200, r.status);
    await assert("status: status = Orden nueva", r.cuerpo?.orden?.status === "Orden nueva", JSON.stringify(r.cuerpo));
  }
  {
    const r = await get(`/api/status?orden=no-existe&tienda=${DATOS_PRUEBA.tienda}&formato=json`);
    await assert("status: orden inexistente -> 404", r.status === 404, r.status);
  }

  console.log(`\n${pasadas} pasadas, ${falladas} falladas`);
  process.exit(falladas > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Error corriendo las pruebas:", err);
  process.exit(1);
});

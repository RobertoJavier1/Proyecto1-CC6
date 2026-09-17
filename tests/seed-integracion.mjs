// Siembra datos de prueba FIJOS para poder correr las pruebas de integración
// de forma repetible (mismos codigos siempre, sin ensuciar tus datos reales).
//
// Requiere que ORIGEN_COURIER ya esté configurado en .env.local con un
// código de ciudad que EXISTA en tu tabla Ciudad (ese será el origen real
// del courier; aquí solo creamos el destino, la tarifa y una tienda).
//
// Uso:
//   node --env-file=.env.local tests/seed-integracion.mjs
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const DATOS_PRUEBA = {
  origen: process.env.ORIGEN_COURIER,
  destino: "TST01",
  tienda: "tienda-prueba",
  precio: "50.00",
};

async function main() {
  if (!DATOS_PRUEBA.origen) {
    console.error(
      "ORIGEN_COURIER no está configurado en .env.local. Configúralo con un código de ciudad que ya exista en tu tabla Ciudad y vuelve a correr este script.",
    );
    process.exit(1);
  }

  // 1) ciudad destino de prueba (no toca tus ciudades reales)
  await pool.query(
    `INSERT INTO Ciudad (codigo, nombre_ciudad)
     VALUES ($1, 'Ciudad De Prueba')
     ON CONFLICT (codigo) DO NOTHING`,
    [DATOS_PRUEBA.destino],
  );

  // 2) tarifa origen(real) -> destino(prueba)
  await pool.query(
    `INSERT INTO Tiene_tarifa (codigo_origen, codigo_destino, precio)
     VALUES ($1, $2, $3)
     ON CONFLICT (codigo_origen, codigo_destino) DO UPDATE SET precio = EXCLUDED.precio`,
    [DATOS_PRUEBA.origen, DATOS_PRUEBA.destino, DATOS_PRUEBA.precio],
  );

  // 3) tienda de prueba, para poder llamar a /api/envio
  await pool.query(
    `INSERT INTO Tiendas (id_tienda, nombre)
     VALUES ($1, 'Tienda De Prueba')
     ON CONFLICT (id_tienda) DO NOTHING`,
    [DATOS_PRUEBA.tienda],
  );

  console.log("Datos de prueba listos:", DATOS_PRUEBA);
  await pool.end();
}

main().catch((err) => {
  console.error("Error sembrando datos de prueba:", err);
  process.exit(1);
});

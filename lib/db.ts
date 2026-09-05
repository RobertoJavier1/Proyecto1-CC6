import { Pool } from "pg";

// Registra en el tipo global la propiedad donde guardamos el pool
declare global {
  var _pgPool: Pool | undefined;
}

// Pool = conexiones a Postgres reutilizables evita abrir/cerrar una por query
// Reutiliza el de global si ya existe; si no, crea uno con datos de .env.local
export const pool =
  global._pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

// Guarda el pool en global para que sobreviva a los recargas de "next dev"
// (si no, cada guardado crearía un pool nuevo y se acumularían conexiones).
if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

// Helper corto para hacer consultas: query(sql, [params]). <T> tipa las filas
// que devuelve, ej: query<{ codigo: string }>("SELECT codigo FROM destinos")
export function query<T extends object = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}

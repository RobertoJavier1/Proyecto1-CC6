import { query } from "./db";

// tienda virtual que consume el webservice, id_tienda es el que manda en &tienda=
export type Tienda = {
  id_tienda: string;
  nombre: string;
};

export async function getTiendas() {
  const { rows } = await query<Tienda & { total_ordenes: string }>(
    `SELECT t.id_tienda, t.nombre, COUNT(o.num_orden) AS total_ordenes
     FROM tiendas t
     LEFT JOIN ordenes o ON o.id_tienda = t.id_tienda
     GROUP BY t.id_tienda
     ORDER BY t.nombre`,
  );
  return rows;
}

export async function getTienda(id_tienda: string) {
  const { rows } = await query<Tienda>(
    "SELECT id_tienda, nombre FROM tiendas WHERE id_tienda = $1",
    [id_tienda],
  );
  return rows[0] ?? null;
}

export async function createTienda(data: Tienda) {
  await query("INSERT INTO tiendas (id_tienda, nombre) VALUES ($1, $2)", [
    data.id_tienda,
    data.nombre,
  ]);
}

export async function updateTienda(id_tienda: string, nombre: string) {
  await query("UPDATE tiendas SET nombre = $1 WHERE id_tienda = $2", [
    nombre,
    id_tienda,
  ]);
}

export async function contarOrdenesTienda(id_tienda: string) {
  const { rows } = await query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM ordenes WHERE id_tienda = $1",
    [id_tienda],
  );
  return Number(rows[0].total);
}

// falla si la tienda ya tiene ordenes, eso se revisa antes en la accion
export async function deleteTienda(id_tienda: string) {
  await query("DELETE FROM tiendas WHERE id_tienda = $1", [id_tienda]);
}

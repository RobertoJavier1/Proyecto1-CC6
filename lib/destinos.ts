import { query } from "./db";

export type Destino = {
  codigo: string;
  nombre_ciudad: string;
  costo_envio: string; // numeric vuelve como string desde pg
};

export async function getDestinos() {
  const { rows } = await query<Destino>(
    "SELECT codigo, nombre_ciudad, costo_envio FROM destinos ORDER BY nombre_ciudad",
  );
  return rows;
}

export async function getDestino(codigo: string) {
  const { rows } = await query<Destino>(
    "SELECT codigo, nombre_ciudad, costo_envio FROM destinos WHERE codigo = $1",
    [codigo],
  );
  return rows[0] ?? null;
}

export async function createDestino(data: Destino) {
  await query(
    "INSERT INTO destinos (codigo, nombre_ciudad, costo_envio) VALUES ($1, $2, $3)",
    [data.codigo, data.nombre_ciudad, data.costo_envio],
  );
}

export async function updateDestino(
  codigo: string,
  data: Pick<Destino, "nombre_ciudad" | "costo_envio">,
) {
  await query(
    "UPDATE destinos SET nombre_ciudad = $1, costo_envio = $2 WHERE codigo = $3",
    [data.nombre_ciudad, data.costo_envio, codigo],
  );
}

export async function deleteDestino(codigo: string) {
  await query("DELETE FROM destinos WHERE codigo = $1", [codigo]);
}

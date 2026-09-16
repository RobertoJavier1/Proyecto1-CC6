import { query } from "./db";

// precio de envio entre un par de ciudades, tiene_tarifa usa (origen, destino)
export type Tarifa = {
  codigo_origen: string;
  codigo_destino: string;
  precio: string; // numeric vuelve como string desde pg
};

// misma tarifa pero con el nombre de las ciudades para mostrar en la ui
export type TarifaConCiudades = Tarifa & {
  nombre_origen: string;
  nombre_destino: string;
};

export async function getTarifa(codigo_origen: string, codigo_destino: string) {
  const { rows } = await query<Tarifa>(
    "SELECT codigo_origen, codigo_destino, precio FROM tiene_tarifa WHERE codigo_origen = $1 AND codigo_destino = $2",
    [codigo_origen, codigo_destino],
  );
  return rows[0] ?? null;
}

export async function getTarifas() {
  const { rows } = await query<TarifaConCiudades>(
    `SELECT t.codigo_origen, t.codigo_destino, t.precio,
            co.nombre_ciudad AS nombre_origen,
            cd.nombre_ciudad AS nombre_destino
     FROM tiene_tarifa t
     JOIN ciudad co ON co.codigo = t.codigo_origen
     JOIN ciudad cd ON cd.codigo = t.codigo_destino
     ORDER BY co.nombre_ciudad, cd.nombre_ciudad`,
  );
  return rows;
}

export async function createTarifa(data: Tarifa) {
  await query(
    "INSERT INTO tiene_tarifa (codigo_origen, codigo_destino, precio) VALUES ($1, $2, $3)",
    [data.codigo_origen, data.codigo_destino, data.precio],
  );
}

export async function updateTarifa(
  codigo_origen: string,
  codigo_destino: string,
  precio: string,
) {
  await query(
    "UPDATE tiene_tarifa SET precio = $1 WHERE codigo_origen = $2 AND codigo_destino = $3",
    [precio, codigo_origen, codigo_destino],
  );
}

export async function deleteTarifa(
  codigo_origen: string,
  codigo_destino: string,
) {
  await query(
    "DELETE FROM tiene_tarifa WHERE codigo_origen = $1 AND codigo_destino = $2",
    [codigo_origen, codigo_destino],
  );
}

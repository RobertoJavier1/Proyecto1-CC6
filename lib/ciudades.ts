import { query } from "./db";

// ciudad cubierta por el courier, codigo son 5 caracteres
export type Ciudad = {
  codigo: string;
  nombre_ciudad: string;
};

export async function getCiudades() {
  const { rows } = await query<Ciudad>(
    "SELECT codigo, nombre_ciudad FROM ciudad ORDER BY nombre_ciudad",
  );
  return rows;
}

export async function getCiudad(codigo: string) {
  const { rows } = await query<Ciudad>(
    "SELECT codigo, nombre_ciudad FROM ciudad WHERE codigo = $1",
    [codigo],
  );
  return rows[0] ?? null;
}

export async function createCiudad(data: Ciudad) {
  await query("INSERT INTO ciudad (codigo, nombre_ciudad) VALUES ($1, $2)", [
    data.codigo,
    data.nombre_ciudad,
  ]);
}

export async function updateCiudad(
  codigo: string,
  data: Pick<Ciudad, "nombre_ciudad">,
) {
  await query("UPDATE ciudad SET nombre_ciudad = $1 WHERE codigo = $2", [
    data.nombre_ciudad,
    codigo,
  ]);
}

export async function deleteCiudad(codigo: string) {
  // falla si hay tarifas u ordenes que referencian esta ciudad
  await query("DELETE FROM ciudad WHERE codigo = $1", [codigo]);
}

import { query } from "./db";

export type Estado = {
  id_estado: number;
  nombre: string;
};

// los 5 estados fijos que pide el enunciado del proyecto
export const ESTADOS_BASE: Estado[] = [
  { id_estado: 1, nombre: "Orden nueva" },
  { id_estado: 2, nombre: "Surtiendose" },
  { id_estado: 3, nombre: "Empacandose" },
  { id_estado: 4, nombre: "En ruta" },
  { id_estado: 5, nombre: "Entregada" },
];

export async function getEstados() {
  const { rows } = await query<Estado>(
    "SELECT id_estado, nombre FROM estados ORDER BY id_estado",
  );
  return rows;
}

export async function getEstado(id_estado: number) {
  const { rows } = await query<Estado>(
    "SELECT id_estado, nombre FROM estados WHERE id_estado = $1",
    [id_estado],
  );
  return rows[0] ?? null;
}

// inserta los 5 estados base si no existen, no pisa los que ya estan
export async function seedEstados() {
  for (const estado of ESTADOS_BASE) {
    await query(
      "INSERT INTO estados (id_estado, nombre) VALUES ($1, $2) ON CONFLICT (id_estado) DO NOTHING",
      [estado.id_estado, estado.nombre],
    );
  }
}

export async function createEstado(data: Estado) {
  await query("INSERT INTO estados (id_estado, nombre) VALUES ($1, $2)", [
    data.id_estado,
    data.nombre,
  ]);
}

export async function updateEstado(id_estado: number, nombre: string) {
  await query("UPDATE estados SET nombre = $1 WHERE id_estado = $2", [
    nombre,
    id_estado,
  ]);
}

export async function deleteEstado(id_estado: number) {
  await query("DELETE FROM estados WHERE id_estado = $1", [id_estado]);
}

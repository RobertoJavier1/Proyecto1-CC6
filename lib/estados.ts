import { query } from "./db";

export type Estado = {
  id_estado: number;
  nombre: string;
};

// Los 5 estados fijos que pide el enunciado del proyecto.
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

export async function seedEstados() {
  for (const estado of ESTADOS_BASE) {
    await query(
      "INSERT INTO estados (id_estado, nombre) VALUES ($1, $2) ON CONFLICT (id_estado) DO NOTHING",
      [estado.id_estado, estado.nombre],
    );
  }
}

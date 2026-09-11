"use server";

import { revalidatePath } from "next/cache";
import {
  createEstado,
  deleteEstado,
  seedEstados,
  updateEstado,
} from "@/lib/estados";

// crea un estado con un id manual, no autoincrementa
export async function createEstadoAction(formData: FormData) {
  const id_estado = Number(formData.get("id_estado"));
  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!Number.isInteger(id_estado) || id_estado < 1) {
    throw new Error("El id del estado debe ser un número entero positivo");
  }
  if (!nombre) {
    throw new Error("El nombre del estado es requerido");
  }

  await createEstado({ id_estado, nombre });
  revalidatePath("/estados");
}

export async function updateEstadoAction(formData: FormData) {
  const id_estado = Number(formData.get("id_estado"));
  const nombre = String(formData.get("nombre") ?? "").trim();

  if (!nombre) {
    throw new Error("El nombre del estado es requerido");
  }

  await updateEstado(id_estado, nombre);
  revalidatePath("/estados");
}

export async function deleteEstadoAction(formData: FormData) {
  const id_estado = Number(formData.get("id_estado"));
  await deleteEstado(id_estado);
  revalidatePath("/estados");
}

// boton de restaurar en la pagina, vuelve a insertar los 5 estados base
export async function seedEstadosAction() {
  await seedEstados();
  revalidatePath("/estados");
}

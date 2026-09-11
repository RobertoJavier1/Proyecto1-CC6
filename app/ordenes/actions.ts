"use server";

import { revalidatePath } from "next/cache";
import { updateEstadoOrden } from "@/lib/ordenes";

// unica accion de esta pantalla, solo cambia el estado de una orden existente
export async function updateEstadoOrdenAction(formData: FormData) {
  const num_orden = Number(formData.get("num_orden"));
  const id_estado = Number(formData.get("id_estado"));

  if (!Number.isInteger(num_orden) || num_orden < 1) {
    throw new Error("Orden inválida");
  }
  if (!Number.isInteger(id_estado) || id_estado < 1) {
    throw new Error("Estado inválido");
  }

  await updateEstadoOrden(num_orden, id_estado);
  revalidatePath("/ordenes");
}

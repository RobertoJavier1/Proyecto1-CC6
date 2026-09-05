"use server";

import { revalidatePath } from "next/cache";
import { updateEstadoOrden } from "@/lib/ordenes";

export async function updateEstadoOrdenAction(formData: FormData) {
  const num_orden = String(formData.get("num_orden") ?? "");
  const id_estado = Number(formData.get("id_estado"));

  if (!num_orden) {
    throw new Error("Orden inválida");
  }
  if (!Number.isInteger(id_estado) || id_estado < 1 || id_estado > 5) {
    throw new Error("Estado inválido");
  }

  await updateEstadoOrden(num_orden, id_estado);
  revalidatePath("/ordenes");
}

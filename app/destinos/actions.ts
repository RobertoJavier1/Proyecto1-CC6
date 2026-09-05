"use server";

import { revalidatePath } from "next/cache";
import { createDestino, deleteDestino, updateDestino } from "@/lib/destinos";

export async function createDestinoAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "")
    .trim()
    .toUpperCase();
  const nombre_ciudad = String(formData.get("nombre_ciudad") ?? "").trim();
  const costo_envio = String(formData.get("costo_envio") ?? "");

  if (codigo.length !== 5) {
    throw new Error("El código del destino debe tener exactamente 5 caracteres");
  }
  if (!nombre_ciudad) {
    throw new Error("El nombre de la ciudad es requerido");
  }
  if (!costo_envio || Number.isNaN(Number(costo_envio))) {
    throw new Error("El costo de envío debe ser un número válido");
  }

  await createDestino({ codigo, nombre_ciudad, costo_envio });
  revalidatePath("/destinos");
}

export async function updateDestinoAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  const nombre_ciudad = String(formData.get("nombre_ciudad") ?? "").trim();
  const costo_envio = String(formData.get("costo_envio") ?? "");

  if (!nombre_ciudad) {
    throw new Error("El nombre de la ciudad es requerido");
  }
  if (!costo_envio || Number.isNaN(Number(costo_envio))) {
    throw new Error("El costo de envío debe ser un número válido");
  }

  await updateDestino(codigo, { nombre_ciudad, costo_envio });
  revalidatePath("/destinos");
}

export async function deleteDestinoAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  await deleteDestino(codigo);
  revalidatePath("/destinos");
}

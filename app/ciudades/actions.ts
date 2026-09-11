"use server";

import { revalidatePath } from "next/cache";
import { createCiudad, deleteCiudad, updateCiudad } from "@/lib/ciudades";
import { createTarifa, deleteTarifa, updateTarifa } from "@/lib/tarifas";

// crea una ciudad nueva, el codigo se normaliza a mayusculas
export async function createCiudadAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "")
    .trim()
    .toUpperCase();
  const nombre_ciudad = String(formData.get("nombre_ciudad") ?? "").trim();

  if (codigo.length !== 5) {
    throw new Error("El código de la ciudad debe tener exactamente 5 caracteres");
  }
  if (!nombre_ciudad) {
    throw new Error("El nombre de la ciudad es requerido");
  }

  await createCiudad({ codigo, nombre_ciudad });
  revalidatePath("/ciudades");
}

// el codigo no se puede editar, solo el nombre
export async function updateCiudadAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  const nombre_ciudad = String(formData.get("nombre_ciudad") ?? "").trim();

  if (!nombre_ciudad) {
    throw new Error("El nombre de la ciudad es requerido");
  }

  await updateCiudad(codigo, { nombre_ciudad });
  revalidatePath("/ciudades");
}

export async function deleteCiudadAction(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  await deleteCiudad(codigo);
  revalidatePath("/ciudades");
}

// crea el precio de envio para un par origen-destino
export async function createTarifaAction(formData: FormData) {
  const codigo_origen = String(formData.get("codigo_origen") ?? "").trim();
  const codigo_destino = String(formData.get("codigo_destino") ?? "").trim();
  const precio = String(formData.get("precio") ?? "");

  if (!codigo_origen || !codigo_destino) {
    throw new Error("Debe seleccionar ciudad de origen y de destino");
  }
  if (!precio || Number.isNaN(Number(precio))) {
    throw new Error("El precio debe ser un número válido");
  }

  await createTarifa({ codigo_origen, codigo_destino, precio });
  revalidatePath("/ciudades");
}

export async function updateTarifaAction(formData: FormData) {
  const codigo_origen = String(formData.get("codigo_origen") ?? "");
  const codigo_destino = String(formData.get("codigo_destino") ?? "");
  const precio = String(formData.get("precio") ?? "");

  if (!precio || Number.isNaN(Number(precio))) {
    throw new Error("El precio debe ser un número válido");
  }

  await updateTarifa(codigo_origen, codigo_destino, precio);
  revalidatePath("/ciudades");
}

export async function deleteTarifaAction(formData: FormData) {
  const codigo_origen = String(formData.get("codigo_origen") ?? "");
  const codigo_destino = String(formData.get("codigo_destino") ?? "");
  await deleteTarifa(codigo_origen, codigo_destino);
  revalidatePath("/ciudades");
}

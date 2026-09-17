"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createCiudad, deleteCiudad, updateCiudad } from "@/lib/ciudades";
import { createTarifa, deleteTarifa, updateTarifa } from "@/lib/tarifas";
import { fallar, listo, mensajeBd, texto } from "@/lib/errores";

const RUTA = "/ciudades";

// crea una ciudad nueva, el codigo se normaliza a mayusculas
export async function createCiudadAction(formData: FormData) {
  await requireAdmin();
  const codigo = texto(formData, "codigo").toUpperCase();
  const nombre_ciudad = texto(formData, "nombre_ciudad");

  if (codigo.length !== 5) {
    fallar(RUTA, "El código de la ciudad debe tener exactamente 5 caracteres");
  }
  if (!nombre_ciudad) {
    fallar(RUTA, "El nombre de la ciudad es requerido");
  }

  let error = "";
  try {
    await createCiudad({ codigo, nombre_ciudad });
  } catch (e) {
    error = mensajeBd(e, `Ya existe una ciudad con el código ${codigo}`);
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
  listo(RUTA, "Ciudad creada correctamente");
}

// el codigo no se puede editar, solo el nombre
export async function updateCiudadAction(formData: FormData) {
  await requireAdmin();
  const codigo = String(formData.get("codigo") ?? "");
  const nombre_ciudad = texto(formData, "nombre_ciudad");

  if (!nombre_ciudad) {
    fallar(RUTA, "El nombre de la ciudad es requerido");
  }

  await updateCiudad(codigo, { nombre_ciudad });
  revalidatePath(RUTA);
  listo(RUTA, "Datos guardados");
}

export async function deleteCiudadAction(formData: FormData) {
  await requireAdmin();
  const codigo = String(formData.get("codigo") ?? "");

  let error = "";
  try {
    await deleteCiudad(codigo);
  } catch (e) {
    error = mensajeBd(e, "No se puede eliminar, hay tarifas u órdenes que dependen de esta ciudad");
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
}

// crea el precio de envio para un par origen-destino
export async function createTarifaAction(formData: FormData) {
  await requireAdmin();
  const codigo_origen = texto(formData, "codigo_origen");
  const codigo_destino = texto(formData, "codigo_destino");
  const precio = String(formData.get("precio") ?? "");

  if (!codigo_origen || !codigo_destino) {
    fallar(RUTA, "Debe seleccionar ciudad de origen y de destino");
  }
  if (!precio || Number.isNaN(Number(precio))) {
    fallar(RUTA, "El precio debe ser un número válido");
  }

  let error = "";
  try {
    await createTarifa({ codigo_origen, codigo_destino, precio });
  } catch (e) {
    error = mensajeBd(e, "Ya existe una tarifa para ese par de ciudades");
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
  listo(RUTA, "Tarifa creada correctamente");
}

export async function updateTarifaAction(formData: FormData) {
  await requireAdmin();
  const codigo_origen = String(formData.get("codigo_origen") ?? "");
  const codigo_destino = String(formData.get("codigo_destino") ?? "");
  const precio = String(formData.get("precio") ?? "");

  if (!precio || Number.isNaN(Number(precio))) {
    fallar(RUTA, "El precio debe ser un número válido");
  }

  await updateTarifa(codigo_origen, codigo_destino, precio);
  revalidatePath(RUTA);
  listo(RUTA, "Datos guardados");
}

export async function deleteTarifaAction(formData: FormData) {
  await requireAdmin();
  const codigo_origen = String(formData.get("codigo_origen") ?? "");
  const codigo_destino = String(formData.get("codigo_destino") ?? "");

  await deleteTarifa(codigo_origen, codigo_destino);
  revalidatePath(RUTA);
}

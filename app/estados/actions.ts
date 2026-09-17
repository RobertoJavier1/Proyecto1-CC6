"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createEstado,
  deleteEstado,
  seedEstados,
  updateEstado,
} from "@/lib/estados";
import { fallar, listo, mensajeBd, texto } from "@/lib/errores";

const RUTA = "/estados";

// crea un estado con un id manual, no autoincrementa
export async function createEstadoAction(formData: FormData) {
  await requireAdmin();
  const id_estado = Number(formData.get("id_estado"));
  const nombre = texto(formData, "nombre");

  if (!Number.isInteger(id_estado) || id_estado < 1) {
    fallar(RUTA, "El id del estado debe ser un número entero positivo");
  }
  if (!nombre) {
    fallar(RUTA, "El nombre del estado es requerido");
  }

  let error = "";
  try {
    await createEstado({ id_estado, nombre });
  } catch (e) {
    error = mensajeBd(e, `Ya existe un estado con el id ${id_estado}`);
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
  listo(RUTA, "Estado creado correctamente");
}

export async function updateEstadoAction(formData: FormData) {
  await requireAdmin();
  const id_estado = Number(formData.get("id_estado"));
  const nombre = texto(formData, "nombre");

  if (!nombre) {
    fallar(RUTA, "El nombre del estado es requerido");
  }

  await updateEstado(id_estado, nombre);
  revalidatePath(RUTA);
  listo(RUTA, "Datos guardados");
}

export async function deleteEstadoAction(formData: FormData) {
  await requireAdmin();
  const id_estado = Number(formData.get("id_estado"));

  let error = "";
  try {
    await deleteEstado(id_estado);
  } catch (e) {
    error = mensajeBd(e, "No se puede eliminar, hay órdenes que dependen de este estado");
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
}

// boton de restaurar en la pagina, vuelve a insertar los 5 estados base
export async function seedEstadosAction() {
  await requireAdmin();

  let error = "";
  try {
    await seedEstados();
  } catch (e) {
    error = mensajeBd(e, "No se pudieron restaurar los estados base");
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
  listo(RUTA, "Estados base restaurados");
}

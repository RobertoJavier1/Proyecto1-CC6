"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  contarOrdenesTienda,
  createTienda,
  deleteTienda,
  updateTienda,
} from "@/lib/tiendas";
import { fallar, mensajeBd, texto } from "@/lib/errores";

// el id viaja en la url del webservice (&tienda=), por eso sin espacios
const REGEX_ID_TIENDA = /^[A-Za-z0-9_-]{1,50}$/;

export async function createTiendaAction(formData: FormData) {
  await requireAdmin();
  const id_tienda = texto(formData, "id_tienda");
  const nombre = texto(formData, "nombre");

  if (!REGEX_ID_TIENDA.test(id_tienda)) {
    fallar(
      "/tiendas",
      "El id solo puede tener letras, números, guion y guion bajo (máx. 50)",
    );
  }
  if (!nombre) fallar("/tiendas", "El nombre es requerido");

  let error = "";
  try {
    await createTienda({ id_tienda, nombre });
  } catch (e) {
    error = mensajeBd(e, `Ya existe una tienda con el id ${id_tienda}`);
  }
  if (error) fallar("/tiendas", error);

  revalidatePath("/tiendas");
}

// el id no se edita porque las ordenes lo referencian
export async function updateTiendaAction(formData: FormData) {
  await requireAdmin();
  const id_tienda = String(formData.get("id_tienda") ?? "");
  const nombre = texto(formData, "nombre");

  if (!nombre) fallar("/tiendas", "El nombre es requerido");

  await updateTienda(id_tienda, nombre);
  revalidatePath("/tiendas");
}

export async function deleteTiendaAction(formData: FormData) {
  await requireAdmin();
  const id_tienda = String(formData.get("id_tienda") ?? "");

  if ((await contarOrdenesTienda(id_tienda)) > 0) {
    fallar("/tiendas", "No se puede eliminar una tienda que tiene órdenes");
  }

  await deleteTienda(id_tienda);
  revalidatePath("/tiendas");
}

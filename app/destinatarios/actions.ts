"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addTelefonoDestinatario,
  contarOrdenesDestinatario,
  createDestinatario,
  deleteDestinatario,
  deleteTelefonoDestinatario,
  updateDestinatario,
} from "@/lib/destinatarios";
import { REGEX_TELEFONO, fallar, listo, texto } from "@/lib/errores";

export async function createDestinatarioAction(formData: FormData) {
  await requireAdmin();
  const nombre = texto(formData, "nombre");
  const telefono = texto(formData, "telefono");

  if (!nombre) fallar("/destinatarios", "El nombre es requerido");
  if (telefono && !REGEX_TELEFONO.test(telefono)) {
    fallar("/destinatarios", "El teléfono no es válido");
  }

  await createDestinatario(nombre, telefono || undefined);
  revalidatePath("/destinatarios");
}

export async function updateDestinatarioAction(formData: FormData) {
  await requireAdmin();
  const id_destinatario = Number(formData.get("id_destinatario"));
  const nombre = texto(formData, "nombre");
  const ruta = `/destinatarios/${id_destinatario}`;

  if (!nombre) fallar(ruta, "El nombre es requerido");

  await updateDestinatario(id_destinatario, nombre);
  revalidatePath("/destinatarios");
  listo(ruta, "Datos guardados");
}

export async function deleteDestinatarioAction(formData: FormData) {
  await requireAdmin();
  const id_destinatario = Number(formData.get("id_destinatario"));

  if ((await contarOrdenesDestinatario(id_destinatario)) > 0) {
    fallar(
      "/destinatarios",
      "No se puede eliminar un destinatario que tiene órdenes",
    );
  }

  await deleteDestinatario(id_destinatario);
  revalidatePath("/destinatarios");
}

export async function addTelefonoDestinatarioAction(formData: FormData) {
  await requireAdmin();
  const id_destinatario = Number(formData.get("id_destinatario"));
  const telefono = texto(formData, "telefono");
  const ruta = `/destinatarios/${id_destinatario}`;

  if (!REGEX_TELEFONO.test(telefono)) fallar(ruta, "El teléfono no es válido");

  await addTelefonoDestinatario(id_destinatario, telefono);
  revalidatePath(ruta);
  revalidatePath("/destinatarios");
}

export async function deleteTelefonoDestinatarioAction(formData: FormData) {
  await requireAdmin();
  const id_destinatario = Number(formData.get("id_destinatario"));
  const id_telefono = Number(formData.get("id_telefono"));

  await deleteTelefonoDestinatario(id_telefono, id_destinatario);
  revalidatePath(`/destinatarios/${id_destinatario}`);
  revalidatePath("/destinatarios");
}

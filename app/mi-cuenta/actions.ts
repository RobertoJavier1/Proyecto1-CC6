"use server";

import { revalidatePath } from "next/cache";
import { iniciarSesion, requireCliente } from "@/lib/auth";
import {
  addTelefonoCliente,
  deleteTelefonoCliente,
  getClienteParaLogin,
  updateCliente,
  updateContrasenaCliente,
} from "@/lib/clientes";
import { verifyPassword } from "@/lib/password";
import { REGEX_TELEFONO, fallar, listo, texto } from "@/lib/errores";

const RUTA = "/mi-cuenta";

// el id siempre sale de la sesion, nunca del formulario
export async function updateMisDatosAction(formData: FormData) {
  const sesion = await requireCliente();
  const nombre = texto(formData, "nombre");
  const direccion = texto(formData, "direccion");

  if (!nombre || !direccion) fallar(RUTA, "Nombre y dirección son requeridos");

  await updateCliente(sesion.id, { nombre, direccion });
  await iniciarSesion({ rol: "cliente", id: sesion.id, nombre });
  revalidatePath("/", "layout");
  listo(RUTA, "Datos guardados");
}

export async function cambiarMiContrasenaAction(formData: FormData) {
  const sesion = await requireCliente();
  const actual = String(formData.get("actual") ?? "");
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  const cliente = await getClienteParaLogin(sesion.id);
  if (!cliente || !(await verifyPassword(actual, cliente.contrasena))) {
    fallar(RUTA, "La contraseña actual no es correcta");
  }
  if (nueva.length < 6) {
    fallar(RUTA, "La contraseña nueva debe tener al menos 6 caracteres");
  }
  if (nueva !== confirmar) fallar(RUTA, "Las contraseñas no coinciden");

  await updateContrasenaCliente(sesion.id, nueva);
  listo(RUTA, "Contraseña actualizada");
}

export async function addMiTelefonoAction(formData: FormData) {
  const sesion = await requireCliente();
  const telefono = texto(formData, "telefono");

  if (!REGEX_TELEFONO.test(telefono)) fallar(RUTA, "El teléfono no es válido");

  await addTelefonoCliente(sesion.id, telefono);
  revalidatePath(RUTA);
}

export async function deleteMiTelefonoAction(formData: FormData) {
  const sesion = await requireCliente();
  const id_telefono = Number(formData.get("id_telefono"));

  await deleteTelefonoCliente(id_telefono, sesion.id);
  revalidatePath(RUTA);
}

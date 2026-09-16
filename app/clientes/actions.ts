"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addTelefonoCliente,
  contarOrdenesCliente,
  createCliente,
  deleteCliente,
  deleteTelefonoCliente,
  updateCliente,
  updateContrasenaCliente,
} from "@/lib/clientes";
import {
  REGEX_TELEFONO,
  fallar,
  listo,
  mensajeBd,
  texto,
} from "@/lib/errores";

export async function createClienteAction(formData: FormData) {
  await requireAdmin();
  const nombre = texto(formData, "nombre");
  const direccion = texto(formData, "direccion");
  const telefono = texto(formData, "telefono");
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!nombre) fallar("/clientes", "El nombre es requerido");
  if (!direccion) fallar("/clientes", "La dirección es requerida");
  if (contrasena.length < 6) {
    fallar("/clientes", "La contraseña debe tener al menos 6 caracteres");
  }
  if (telefono && !REGEX_TELEFONO.test(telefono)) {
    fallar("/clientes", "El teléfono no es válido");
  }

  let id_cliente = 0;
  let error = "";
  try {
    id_cliente = await createCliente({ nombre, direccion, contrasena, telefono });
  } catch (e) {
    error = mensajeBd(e);
  }
  if (error) fallar("/clientes", error);

  revalidatePath("/clientes");
  // el codigo es con lo que el cliente inicia sesion, por eso se le avisa
  listo("/clientes", `Cliente creado con código ${id_cliente}`);
}

export async function updateClienteAction(formData: FormData) {
  await requireAdmin();
  const id_cliente = Number(formData.get("id_cliente"));
  const nombre = texto(formData, "nombre");
  const direccion = texto(formData, "direccion");
  const ruta = `/clientes/${id_cliente}`;

  if (!nombre || !direccion) {
    fallar(ruta, "Nombre y dirección son requeridos");
  }

  await updateCliente(id_cliente, { nombre, direccion });
  revalidatePath("/clientes");
  listo(ruta, "Datos guardados");
}

export async function resetContrasenaClienteAction(formData: FormData) {
  await requireAdmin();
  const id_cliente = Number(formData.get("id_cliente"));
  const contrasena = String(formData.get("contrasena") ?? "");
  const ruta = `/clientes/${id_cliente}`;

  if (contrasena.length < 6) {
    fallar(ruta, "La contraseña debe tener al menos 6 caracteres");
  }

  await updateContrasenaCliente(id_cliente, contrasena);
  listo(ruta, "Contraseña actualizada");
}

export async function deleteClienteAction(formData: FormData) {
  await requireAdmin();
  const id_cliente = Number(formData.get("id_cliente"));

  // las ordenes son historial del courier, no se borran en cascada
  if ((await contarOrdenesCliente(id_cliente)) > 0) {
    fallar("/clientes", "No se puede eliminar un cliente que tiene órdenes");
  }

  await deleteCliente(id_cliente);
  revalidatePath("/clientes");
}

export async function addTelefonoClienteAction(formData: FormData) {
  await requireAdmin();
  const id_cliente = Number(formData.get("id_cliente"));
  const telefono = texto(formData, "telefono");
  const ruta = `/clientes/${id_cliente}`;

  if (!REGEX_TELEFONO.test(telefono)) fallar(ruta, "El teléfono no es válido");

  await addTelefonoCliente(id_cliente, telefono);
  revalidatePath(ruta);
  revalidatePath("/clientes");
}

export async function deleteTelefonoClienteAction(formData: FormData) {
  await requireAdmin();
  const id_cliente = Number(formData.get("id_cliente"));
  const id_telefono = Number(formData.get("id_telefono"));

  await deleteTelefonoCliente(id_telefono, id_cliente);
  revalidatePath(`/clientes/${id_cliente}`);
  revalidatePath("/clientes");
}

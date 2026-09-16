"use server";

import { revalidatePath } from "next/cache";
import { iniciarSesion, requireAdmin } from "@/lib/auth";
import {
  contarAdministradores,
  createAdministrador,
  deleteAdministrador,
  updateContrasenaAdmin,
  updateUsuarioAdmin,
} from "@/lib/administradores";
import { fallar, listo, mensajeBd, texto } from "@/lib/errores";

const RUTA = "/administradores";

// si el usuario fuera solo numeros chocaria con el codigo de cliente en el login
function validarUsuario(usuario: string) {
  if (!usuario || usuario.length > 50) {
    fallar(RUTA, "El usuario es requerido (máximo 50 caracteres)");
  }
  if (/^\d+$/.test(usuario)) {
    fallar(RUTA, "El usuario no puede ser solo números");
  }
}

export async function createAdminAction(formData: FormData) {
  await requireAdmin();
  const usuario = texto(formData, "usuario");
  const contrasena = String(formData.get("contrasena") ?? "");

  validarUsuario(usuario);
  if (contrasena.length < 6) {
    fallar(RUTA, "La contraseña debe tener al menos 6 caracteres");
  }

  let error = "";
  try {
    await createAdministrador(usuario, contrasena);
  } catch (e) {
    error = mensajeBd(e, `El usuario ${usuario} ya existe`);
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
}

export async function updateAdminAction(formData: FormData) {
  const sesion = await requireAdmin();
  const id_admin = Number(formData.get("id_admin"));
  const usuario = texto(formData, "usuario");

  validarUsuario(usuario);

  let error = "";
  try {
    await updateUsuarioAdmin(id_admin, usuario);
  } catch (e) {
    error = mensajeBd(e, `El usuario ${usuario} ya existe`);
  }
  if (error) fallar(RUTA, error);

  // si se cambio su propio usuario se actualiza el nombre en la sesion
  if (id_admin === sesion.id) {
    await iniciarSesion({ rol: "admin", id: sesion.id, nombre: usuario });
  }
  revalidatePath("/", "layout");
}

export async function resetContrasenaAdminAction(formData: FormData) {
  await requireAdmin();
  const id_admin = Number(formData.get("id_admin"));
  const contrasena = String(formData.get("contrasena") ?? "");

  if (contrasena.length < 6) {
    fallar(RUTA, "La contraseña debe tener al menos 6 caracteres");
  }

  await updateContrasenaAdmin(id_admin, contrasena);
  listo(RUTA, "Contraseña actualizada");
}

export async function deleteAdminAction(formData: FormData) {
  const sesion = await requireAdmin();
  const id_admin = Number(formData.get("id_admin"));

  if (id_admin === sesion.id) {
    fallar(RUTA, "No puede eliminar su propio usuario");
  }
  if ((await contarAdministradores()) <= 1) {
    fallar(RUTA, "Debe quedar al menos un administrador");
  }

  await deleteAdministrador(id_admin);
  revalidatePath(RUTA);
}

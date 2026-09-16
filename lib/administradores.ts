import { query } from "./db";
import { hashPassword } from "./password";

export type Administrador = {
  id_admin: number;
  usuario: string;
};

export async function getAdministradores() {
  const { rows } = await query<Administrador>(
    "SELECT id_admin, usuario FROM administradores ORDER BY usuario",
  );
  return rows;
}

export async function contarAdministradores() {
  const { rows } = await query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM administradores",
  );
  return Number(rows[0].total);
}

export async function getAdminParaLogin(usuario: string) {
  const { rows } = await query<Administrador & { contrasena: string }>(
    "SELECT id_admin, usuario, contrasena FROM administradores WHERE usuario = $1",
    [usuario],
  );
  return rows[0] ?? null;
}

export async function createAdministrador(usuario: string, contrasena: string) {
  const { rows } = await query<{ id_admin: number }>(
    "INSERT INTO administradores (usuario, contrasena) VALUES ($1, $2) RETURNING id_admin",
    [usuario, await hashPassword(contrasena)],
  );
  return rows[0].id_admin;
}

export async function updateUsuarioAdmin(id_admin: number, usuario: string) {
  await query("UPDATE administradores SET usuario = $1 WHERE id_admin = $2", [
    usuario,
    id_admin,
  ]);
}

export async function updateContrasenaAdmin(
  id_admin: number,
  contrasena: string,
) {
  await query("UPDATE administradores SET contrasena = $1 WHERE id_admin = $2", [
    await hashPassword(contrasena),
    id_admin,
  ]);
}

export async function guardarHashAdmin(id_admin: number, hash: string) {
  await query("UPDATE administradores SET contrasena = $1 WHERE id_admin = $2", [
    hash,
    id_admin,
  ]);
}

export async function deleteAdministrador(id_admin: number) {
  await query("DELETE FROM administradores WHERE id_admin = $1", [id_admin]);
}

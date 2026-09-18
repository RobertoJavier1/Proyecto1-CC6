import { pool, query } from "./db";
import type { Telefono } from "./clientes";

export type Destinatario = {
  id_destinatario: number;
  nombre: string;
};

export type DestinatarioConTelefonos = Destinatario & {
  telefonos: string[];
};

export async function getDestinatarios() {
  const { rows } = await query<DestinatarioConTelefonos>(
    `SELECT d.id_destinatario, d.nombre,
            COALESCE(array_agg(t.telefono ORDER BY t.telefono)
                     FILTER (WHERE t.telefono IS NOT NULL), '{}') AS telefonos
     FROM destinatario d
     LEFT JOIN telefono_destinatarios t ON t.id_destinatario = d.id_destinatario
     GROUP BY d.id_destinatario
     ORDER BY d.nombre`,
  );
  return rows;
}

export async function getDestinatario(id_destinatario: number) {
  const { rows } = await query<Destinatario>(
    "SELECT id_destinatario, nombre FROM destinatario WHERE id_destinatario = $1",
    [id_destinatario],
  );
  return rows[0] ?? null;
}

export async function createDestinatario(nombre: string, telefono?: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id_destinatario: number }>(
      "INSERT INTO destinatario (nombre) VALUES ($1) RETURNING id_destinatario",
      [nombre],
    );
    const id_destinatario = rows[0].id_destinatario;
    if (telefono) {
      await client.query(
        "INSERT INTO telefono_destinatarios (telefono, id_destinatario) VALUES ($1, $2)",
        [telefono, id_destinatario],
      );
    }
    await client.query("COMMIT");
    return id_destinatario;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updateDestinatario(id_destinatario: number, nombre: string) {
  await query("UPDATE destinatario SET nombre = $1 WHERE id_destinatario = $2", [
    nombre,
    id_destinatario,
  ]);
}

export async function contarOrdenesDestinatario(id_destinatario: number) {
  const { rows } = await query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM ordenes WHERE id_destinatario = $1",
    [id_destinatario],
  );
  return Number(rows[0].total);
}

export async function deleteDestinatario(id_destinatario: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM telefono_destinatarios WHERE id_destinatario = $1",
      [id_destinatario],
    );
    await client.query("DELETE FROM destinatario WHERE id_destinatario = $1", [
      id_destinatario,
    ]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getTelefonosDestinatario(id_destinatario: number) {
  const { rows } = await query<Telefono>(
    "SELECT id_telefono, telefono FROM telefono_destinatarios WHERE id_destinatario = $1 ORDER BY telefono",
    [id_destinatario],
  );
  return rows;
}

export async function addTelefonoDestinatario(
  id_destinatario: number,
  telefono: string,
) {
  await query(
    "INSERT INTO telefono_destinatarios (telefono, id_destinatario) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [telefono, id_destinatario],
  );
}

// se pide el id_destinatario tambien para que no se borren telefonos ajenos
export async function deleteTelefonoDestinatario(
  id_telefono: number,
  id_destinatario: number,
) {
  await query(
    "DELETE FROM telefono_destinatarios WHERE id_telefono = $1 AND id_destinatario = $2",
    [id_telefono, id_destinatario],
  );
}

import { pool, query } from "./db";
import { hashPassword } from "./password";

export type Cliente = {
  id_cliente: number;
  nombre: string;
  direccion: string;
};

export type ClienteConTelefonos = Cliente & {
  telefonos: string[];
};

export type Telefono = {
  id_telefono: number;
  telefono: string;
};

// array_agg junta los telefonos en una sola fila por cliente
export async function getClientes() {
  const { rows } = await query<ClienteConTelefonos>(
    `SELECT c.id_cliente, c.nombre, c.direccion,
            COALESCE(array_agg(t.telefono ORDER BY t.telefono)
                     FILTER (WHERE t.telefono IS NOT NULL), '{}') AS telefonos
     FROM clientes c
     LEFT JOIN telefono_clientes t ON t.id_cliente = c.id_cliente
     GROUP BY c.id_cliente
     ORDER BY c.nombre`,
  );
  return rows;
}

export async function getCliente(id_cliente: number) {
  const { rows } = await query<Cliente>(
    "SELECT id_cliente, nombre, direccion FROM clientes WHERE id_cliente = $1",
    [id_cliente],
  );
  return rows[0] ?? null;
}

// solo para el login, es la unica consulta que devuelve la contraseña
export async function getClienteParaLogin(id_cliente: number) {
  const { rows } = await query<Cliente & { contrasena: string }>(
    "SELECT id_cliente, nombre, direccion, contrasena FROM clientes WHERE id_cliente = $1",
    [id_cliente],
  );
  return rows[0] ?? null;
}

export async function createCliente(data: {
  nombre: string;
  direccion: string;
  contrasena: string;
  telefono?: string;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id_cliente: number }>(
      "INSERT INTO clientes (nombre, direccion, contrasena) VALUES ($1, $2, $3) RETURNING id_cliente",
      [data.nombre, data.direccion, await hashPassword(data.contrasena)],
    );
    const id_cliente = rows[0].id_cliente;
    if (data.telefono) {
      await client.query(
        "INSERT INTO telefono_clientes (telefono, id_cliente) VALUES ($1, $2)",
        [data.telefono, id_cliente],
      );
    }
    await client.query("COMMIT");
    return id_cliente;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updateCliente(
  id_cliente: number,
  data: Pick<Cliente, "nombre" | "direccion">,
) {
  await query(
    "UPDATE clientes SET nombre = $1, direccion = $2 WHERE id_cliente = $3",
    [data.nombre, data.direccion, id_cliente],
  );
}

export async function updateContrasenaCliente(
  id_cliente: number,
  contrasena: string,
) {
  await query("UPDATE clientes SET contrasena = $1 WHERE id_cliente = $2", [
    await hashPassword(contrasena),
    id_cliente,
  ]);
}

// se usa en el login para pasar contraseñas viejas en texto plano a hash
export async function guardarHashCliente(id_cliente: number, hash: string) {
  await query("UPDATE clientes SET contrasena = $1 WHERE id_cliente = $2", [
    hash,
    id_cliente,
  ]);
}

export async function contarOrdenesCliente(id_cliente: number) {
  const { rows } = await query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM ordenes WHERE id_cliente = $1",
    [id_cliente],
  );
  return Number(rows[0].total);
}

// primero se borran los telefonos por la llave foranea
export async function deleteCliente(id_cliente: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM telefono_clientes WHERE id_cliente = $1", [
      id_cliente,
    ]);
    await client.query("DELETE FROM clientes WHERE id_cliente = $1", [
      id_cliente,
    ]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getTelefonosCliente(id_cliente: number) {
  const { rows } = await query<Telefono>(
    "SELECT id_telefono, telefono FROM telefono_clientes WHERE id_cliente = $1 ORDER BY telefono",
    [id_cliente],
  );
  return rows;
}

export async function addTelefonoCliente(id_cliente: number, telefono: string) {
  await query(
    "INSERT INTO telefono_clientes (telefono, id_cliente) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [telefono, id_cliente],
  );
}

// se pide el id_cliente tambien para que un cliente no borre telefonos ajenos
export async function deleteTelefonoCliente(
  id_telefono: number,
  id_cliente: number,
) {
  await query(
    "DELETE FROM telefono_clientes WHERE id_telefono = $1 AND id_cliente = $2",
    [id_telefono, id_cliente],
  );
}

export type OrdenCliente = {
  num_orden: number;
  fecha_creacion: string;
  destinatario: string;
  direccion_entrega: string;
  codigo_origen: string;
  codigo_destino: string;
  costo_envio: string;
  id_estado: number;
  estado_nombre: string;
};

// seguimiento de los envios del cliente logueado
export async function getOrdenesDeCliente(id_cliente: number) {
  const { rows } = await query<OrdenCliente>(
    `SELECT o.num_orden, o.fecha_creacion, d.nombre AS destinatario,
            o.direccion_entrega, o.codigo_origen, o.codigo_destino,
            o.costo_envio, o.id_estado, e.nombre AS estado_nombre
     FROM ordenes o
     JOIN destinatario d ON d.id_destinatario = o.id_destinatario
     JOIN estados e ON e.id_estado = o.id_estado
     WHERE o.id_cliente = $1
     ORDER BY o.fecha_creacion DESC, o.num_orden DESC`,
    [id_cliente],
  );
  return rows;
}

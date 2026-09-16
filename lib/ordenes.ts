import { query } from "./db";

export type OrdenConDetalle = {
  num_orden: number;
  num_orden_tienda: string | null;
  fecha_creacion: string;
  direccion_entrega: string;
  origen: "cliente" | "tienda";
  origen_nombre: string;
  destinatario: string;
  codigo_origen: string;
  nombre_ciudad_origen: string;
  codigo_destino: string;
  nombre_ciudad_destino: string;
  costo_envio: string;
  id_estado: number;
  estado_nombre: string;
};

// id_cliente e id_tienda son mutuamente excluyentes, por eso
// el left join + coalesce para sacar el nombre venga de la que este llena
const SELECT_ORDENES = `
  SELECT o.num_orden, o.num_orden_tienda, o.fecha_creacion, o.direccion_entrega,
         CASE WHEN o.id_cliente IS NOT NULL THEN 'cliente' ELSE 'tienda' END AS origen,
         COALESCE(c.nombre, t.nombre) AS origen_nombre,
         d.nombre AS destinatario,
         o.codigo_origen, co.nombre_ciudad AS nombre_ciudad_origen,
         o.codigo_destino, cd.nombre_ciudad AS nombre_ciudad_destino,
         o.costo_envio, o.id_estado, e.nombre AS estado_nombre
  FROM ordenes o
  LEFT JOIN clientes c ON c.id_cliente = o.id_cliente
  LEFT JOIN tiendas t ON t.id_tienda = o.id_tienda
  JOIN destinatario d ON d.id_destinatario = o.id_destinatario
  JOIN ciudad co ON co.codigo = o.codigo_origen
  JOIN ciudad cd ON cd.codigo = o.codigo_destino
  JOIN estados e ON e.id_estado = o.id_estado
`;

export async function getOrdenes() {
  const { rows } = await query<OrdenConDetalle>(
    `${SELECT_ORDENES} ORDER BY o.fecha_creacion DESC, o.num_orden DESC`,
  );
  return rows;
}

export async function getOrden(num_orden: number) {
  const { rows } = await query<OrdenConDetalle>(
    `${SELECT_ORDENES} WHERE o.num_orden = $1`,
    [num_orden],
  );
  return rows[0] ?? null;
}

export async function updateEstadoOrden(num_orden: number, id_estado: number) {
  await query("UPDATE ordenes SET id_estado = $1 WHERE num_orden = $2", [
    id_estado,
    num_orden,
  ]);
}

export type SeguimientoOrden = {
  num_orden: number;
  fecha_creacion: string;
  codigo_destino: string;
  nombre_ciudad_destino: string;
  id_estado: number;
  estado_nombre: string;
};

// pantalla publica de rastreo (sin login), solo datos no sensibles:
// nada de direccion de entrega, destinatario ni quien contrato la orden
export async function getSeguimientoOrden(num_orden: number) {
  const { rows } = await query<SeguimientoOrden>(
    `SELECT o.num_orden, o.fecha_creacion,
            o.codigo_destino, cd.nombre_ciudad AS nombre_ciudad_destino,
            o.id_estado, e.nombre AS estado_nombre
     FROM ordenes o
     JOIN ciudad cd ON cd.codigo = o.codigo_destino
     JOIN estados e ON e.id_estado = o.id_estado
     WHERE o.num_orden = $1`,
    [num_orden],
  );
  return rows[0] ?? null;
}

// orden contratada directamente por un cliente registrado (no viene de una tienda)
export async function createOrdenCliente(data: {
  id_cliente: number;
  id_destinatario: number;
  direccion_entrega: string;
  codigo_origen: string;
  codigo_destino: string;
  costo_envio: string;
}) {
  const { rows } = await query<{ num_orden: number }>(
    `INSERT INTO ordenes
       (direccion_entrega, id_cliente, id_destinatario, codigo_origen, codigo_destino, costo_envio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING num_orden`,
    [
      data.direccion_entrega,
      data.id_cliente,
      data.id_destinatario,
      data.codigo_origen,
      data.codigo_destino,
      data.costo_envio,
    ],
  );
  return rows[0].num_orden;
}

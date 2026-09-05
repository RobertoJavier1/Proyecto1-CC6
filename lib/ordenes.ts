import { query } from "./db";

export type OrdenConDetalle = {
  num_orden: string;
  tienda: string;
  destinatario: string;
  direccion_entrega: string;
  fecha_creacion: string;
  codigo_destino: string;
  nombre_ciudad: string;
  id_estado: number;
  estado_nombre: string;
};

export async function getOrdenes() {
  const { rows } = await query<OrdenConDetalle>(
    `SELECT o.num_orden, o.tienda, o.destinatario, o.direccion_entrega,
            o.fecha_creacion, o.codigo_destino, d.nombre_ciudad,
            o.id_estado, e.nombre AS estado_nombre
     FROM ordenes o
     JOIN destinos d ON d.codigo = o.codigo_destino
     JOIN estados e ON e.id_estado = o.id_estado
     ORDER BY o.fecha_creacion DESC, o.num_orden DESC`,
  );
  return rows;
}

export async function getOrden(num_orden: string) {
  const { rows } = await query<OrdenConDetalle>(
    `SELECT o.num_orden, o.tienda, o.destinatario, o.direccion_entrega,
            o.fecha_creacion, o.codigo_destino, d.nombre_ciudad,
            o.id_estado, e.nombre AS estado_nombre
     FROM ordenes o
     JOIN destinos d ON d.codigo = o.codigo_destino
     JOIN estados e ON e.id_estado = o.id_estado
     WHERE o.num_orden = $1`,
    [num_orden],
  );
  return rows[0] ?? null;
}

export async function updateEstadoOrden(num_orden: string, id_estado: number) {
  await query("UPDATE ordenes SET id_estado = $1 WHERE num_orden = $2", [
    id_estado,
    num_orden,
  ]);
}

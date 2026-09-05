import { getEstados } from "@/lib/estados";
import { getOrdenes } from "@/lib/ordenes";
import { updateEstadoOrdenAction } from "./actions";

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function OrdenesPage() {
  const [ordenes, estados] = await Promise.all([getOrdenes(), getEstados()]);

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Órdenes de envío</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Seguimiento y actualización del estado de cada envío contratado.
        </p>
      </div>

      <div className="flex flex-col overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-[110px_110px_1fr_1fr_110px_100px_170px_90px] gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <div>Orden</div>
          <div>Tienda</div>
          <div>Destinatario</div>
          <div>Dirección</div>
          <div>Destino</div>
          <div>Fecha</div>
          <div>Estado</div>
          <div></div>
        </div>

        {ordenes.map((orden) => (
          <div
            key={orden.num_orden}
            className="min-w-[900px] grid grid-cols-[110px_110px_1fr_1fr_110px_100px_170px_90px] gap-3 items-center border-b border-zinc-100 dark:border-zinc-900 py-2"
          >
            <div className="font-mono text-sm truncate" title={orden.num_orden}>
              {orden.num_orden}
            </div>
            <div className="text-sm truncate" title={orden.tienda}>
              {orden.tienda}
            </div>
            <div className="text-sm truncate" title={orden.destinatario}>
              {orden.destinatario}
            </div>
            <div className="text-sm truncate" title={orden.direccion_entrega}>
              {orden.direccion_entrega}
            </div>
            <div className="text-sm">
              {orden.nombre_ciudad}{" "}
              <span className="text-zinc-500 font-mono text-xs">
                ({orden.codigo_destino})
              </span>
            </div>
            <div className="text-sm">{formatFecha(orden.fecha_creacion)}</div>

            <form action={updateEstadoOrdenAction} className="contents">
              <input type="hidden" name="num_orden" value={orden.num_orden} />
              <select
                name="id_estado"
                defaultValue={orden.id_estado}
                className="border rounded px-2 py-1 text-sm dark:bg-black"
              >
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.id_estado}. {estado.nombre}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="text-xs rounded border px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                Guardar
              </button>
            </form>
          </div>
        ))}

        {ordenes.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay órdenes registradas todavía.
          </div>
        )}
      </div>
    </div>
  );
}

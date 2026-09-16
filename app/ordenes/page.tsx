import { getEstados } from "@/lib/estados";
import { getOrdenes } from "@/lib/ordenes";
import { getClientes } from "@/lib/clientes";
import { getDestinatarios } from "@/lib/destinatarios";
import { getCiudad, getCiudades } from "@/lib/ciudades";
import Aviso from "../_components/aviso";
import { createOrdenAction, updateEstadoOrdenAction } from "./actions";

// la fecha llega como timestamp de postgres, se muestra en formato local
function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function OrdenesPage({
  searchParams,
}: PageProps<"/ordenes">) {
  const { error, ok } = await searchParams;
  const [ordenes, estados, clientes, destinatarios, ciudades] =
    await Promise.all([
      getOrdenes(),
      getEstados(),
      getClientes(),
      getDestinatarios(),
      getCiudades(),
    ]);

  const codigo_origen = process.env.ORIGEN_COURIER;
  const ciudad_origen = codigo_origen ? await getCiudad(codigo_origen) : null;

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Órdenes de envío</h1>
        <p className="text-zinc-600">
          Seguimiento y actualización del estado de cada envío contratado.
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      {/* registro de una orden a nombre de un cliente que llega directo, sin pasar por una tienda */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-accent">Nueva orden</h2>
          {ciudad_origen ? (
            <p className="text-zinc-600 text-sm">
              Origen: {ciudad_origen.nombre_ciudad} ({ciudad_origen.codigo})
            </p>
          ) : (
            <p className="text-red-600 text-sm">
              Falta configurar ORIGEN_COURIER y crear esa ciudad en{" "}
              <span className="font-medium">Ciudades</span> antes de poder
              crear órdenes.
            </p>
          )}
        </div>

        <form
          action={createOrdenAction}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="id_cliente">
              Cliente
            </label>
            <select
              id="id_cliente"
              name="id_cliente"
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Seleccione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.id_cliente} — {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="id_destinatario">
              Destinatario existente
            </label>
            <select
              id="id_destinatario"
              name="id_destinatario"
              className="border rounded px-2 py-1"
            >
              <option value="">-- Nuevo destinatario --</option>
              {destinatarios.map((destinatario) => (
                <option
                  key={destinatario.id_destinatario}
                  value={destinatario.id_destinatario}
                >
                  {destinatario.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              htmlFor="nuevo_destinatario_nombre"
            >
              Nombre (si es nuevo)
            </label>
            <input
              id="nuevo_destinatario_nombre"
              name="nuevo_destinatario_nombre"
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              htmlFor="nuevo_destinatario_telefono"
            >
              Teléfono (si es nuevo)
            </label>
            <input
              id="nuevo_destinatario_telefono"
              name="nuevo_destinatario_telefono"
              className="border rounded px-2 py-1 w-36"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-sm font-medium" htmlFor="direccion_entrega">
              Dirección de entrega
            </label>
            <input
              id="direccion_entrega"
              name="direccion_entrega"
              required
              maxLength={255}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="codigo_destino">
              Ciudad destino
            </label>
            <select
              id="codigo_destino"
              name="codigo_destino"
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Seleccione...</option>
              {ciudades.map((ciudad) => (
                <option key={ciudad.codigo} value={ciudad.codigo}>
                  {ciudad.nombre_ciudad} ({ciudad.codigo})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Crear orden
          </button>
        </form>
      </section>

      <div className="flex flex-col overflow-x-auto">
        <div className="min-w-[1000px] grid grid-cols-[90px_150px_1fr_1fr_150px_100px_170px_90px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Orden</div>
          <div>Contratante</div>
          <div>Destinatario</div>
          <div>Dirección</div>
          <div>Ruta</div>
          <div>Fecha</div>
          <div>Estado</div>
          <div></div>
        </div>

        {ordenes.map((orden) => (
          <div
            key={orden.num_orden}
            className="min-w-[1000px] grid grid-cols-[90px_150px_1fr_1fr_150px_100px_170px_90px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <div
              className="font-mono text-sm truncate"
              title={String(orden.num_orden)}
            >
              {orden.num_orden}
            </div>
            {/* la orden viene de un cliente individual o de una tienda, nunca ambos */}
            <div className="text-sm truncate" title={orden.origen_nombre}>
              <span className="text-zinc-500 text-xs uppercase mr-1">
                {orden.origen === "cliente" ? "Cliente" : "Tienda"}
              </span>
              {orden.origen_nombre}
            </div>
            <div className="text-sm truncate" title={orden.destinatario}>
              {orden.destinatario}
            </div>
            <div className="text-sm truncate" title={orden.direccion_entrega}>
              {orden.direccion_entrega}
            </div>
            <div className="text-sm">
              <span className="font-mono text-xs">{orden.codigo_origen}</span>
              {" → "}
              <span className="font-mono text-xs">{orden.codigo_destino}</span>
            </div>
            <div className="text-sm">{formatFecha(orden.fecha_creacion)}</div>

            <form action={updateEstadoOrdenAction} className="contents">
              <input type="hidden" name="num_orden" value={orden.num_orden} />
              <select
                key={orden.id_estado}
                name="id_estado"
                defaultValue={orden.id_estado}
                className="border rounded px-2 py-1 text-sm"
              >
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.id_estado}. {estado.nombre}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
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

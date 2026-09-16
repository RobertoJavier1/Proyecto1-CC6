import { notFound } from "next/navigation";
import { requireCliente } from "@/lib/auth";
import {
  getCliente,
  getOrdenesDeCliente,
  getTelefonosCliente,
} from "@/lib/clientes";
import Aviso from "../_components/aviso";
import Telefonos from "../_components/telefonos";
import {
  addMiTelefonoAction,
  cambiarMiContrasenaAction,
  deleteMiTelefonoAction,
  updateMisDatosAction,
} from "./actions";

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function MiCuentaPage({
  searchParams,
}: PageProps<"/mi-cuenta">) {
  const sesion = await requireCliente();
  const { error, ok } = await searchParams;

  const [cliente, telefonos, ordenes] = await Promise.all([
    getCliente(sesion.id),
    getTelefonosCliente(sesion.id),
    getOrdenesDeCliente(sesion.id),
  ]);
  // el admin pudo haber borrado al cliente con la sesion abierta
  if (!cliente) notFound();

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Mi cuenta</h1>
        <p className="text-zinc-600">
          Código de cliente{" "}
          <span className="font-mono">{cliente.id_cliente}</span>
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      {/* seguimiento, solo lectura para el cliente */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-accent">Mis envíos</h2>
        <div className="flex flex-col overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-[70px_1fr_1fr_130px_100px_90px_120px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
            <div>Orden</div>
            <div>Destinatario</div>
            <div>Dirección</div>
            <div>Ruta</div>
            <div>Fecha</div>
            <div>Costo</div>
            <div>Estado</div>
          </div>

          {ordenes.map((orden) => (
            <div
              key={orden.num_orden}
              className="min-w-[700px] grid grid-cols-[70px_1fr_1fr_130px_100px_90px_120px] gap-3 items-center border-b border-zinc-100 py-2"
            >
              <div className="font-mono text-sm">{orden.num_orden}</div>
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
              <div className="text-sm">Q{orden.costo_envio}</div>
              <div className="text-sm">
                <span className="text-zinc-500">{orden.id_estado}.</span>{" "}
                {orden.estado_nombre}
              </div>
            </div>
          ))}

          {ordenes.length === 0 && (
            <div className="py-6 text-center text-zinc-500">
              Todavía no tiene envíos registrados.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-accent">Mis datos</h2>
          <form
            action={updateMisDatosAction}
            className="flex flex-col gap-3 border border-zinc-200 rounded-lg p-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                required
                maxLength={150}
                defaultValue={cliente.nombre}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="direccion">
                Dirección
              </label>
              <input
                id="direccion"
                name="direccion"
                required
                maxLength={255}
                defaultValue={cliente.direccion}
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              type="submit"
              className="self-start rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Guardar
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-accent">Contraseña</h2>
          <form
            action={cambiarMiContrasenaAction}
            className="flex flex-col gap-3 border border-zinc-200 rounded-lg p-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="actual">
                Contraseña actual
              </label>
              <input
                id="actual"
                name="actual"
                type="password"
                required
                autoComplete="current-password"
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="nueva">
                Nueva contraseña
              </label>
              <input
                id="nueva"
                name="nueva"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="confirmar">
                Confirmar contraseña
              </label>
              <input
                id="confirmar"
                name="confirmar"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              type="submit"
              className="self-start rounded border border-accent text-accent px-4 py-2 text-sm font-medium hover:bg-accent/10"
            >
              Cambiar contraseña
            </button>
          </form>
        </section>
      </div>

      <Telefonos
        telefonos={telefonos}
        campo="id_cliente"
        valor={cliente.id_cliente}
        addAction={addMiTelefonoAction}
        deleteAction={deleteMiTelefonoAction}
      />
    </div>
  );
}

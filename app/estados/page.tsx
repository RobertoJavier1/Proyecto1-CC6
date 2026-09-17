import { getEstados } from "@/lib/estados";
import Aviso from "../_components/aviso";
import {
  createEstadoAction,
  deleteEstadoAction,
  seedEstadosAction,
  updateEstadoAction,
} from "./actions";

export default async function EstadosPage({
  searchParams,
}: PageProps<"/estados">) {
  const { error, ok } = await searchParams;
  const estados = await getEstados();

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-accent">Estados</h1>
          <p className="text-zinc-600">
            Estados por los que pasa una orden de envío.
          </p>
        </div>
        {/* por si alguien borra un estado default por error */}
        <form action={seedEstadosAction}>
          <button
            type="submit"
            className="text-xs rounded border border-accent text-accent px-3 py-2 hover:bg-accent/10 whitespace-nowrap"
          >
            Restaurar 5 estados base
          </button>
        </form>
      </div>

      <Aviso error={error} ok={ok} />

      <form
        action={createEstadoAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="id_estado">
            Id
          </label>
          <input
            id="id_estado"
            name="id_estado"
            type="number"
            min="1"
            required
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar estado
        </button>
      </form>

      <div className="flex flex-col">
        <div className="grid grid-cols-[60px_1fr_80px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Id</div>
          <div>Nombre</div>
          <div></div>
          <div></div>
        </div>

        {estados.map((estado) => (
          <div
            key={estado.id_estado}
            className="grid grid-cols-[60px_1fr_80px_80px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <div className="font-mono text-sm">{estado.id_estado}</div>

            <form
              id={`update-estado-${estado.id_estado}`}
              action={updateEstadoAction}
              className="contents"
            >
              <input type="hidden" name="id_estado" value={estado.id_estado} />
              <input
                name="nombre"
                defaultValue={estado.nombre}
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
              >
                Guardar
              </button>
            </form>

            <form action={deleteEstadoAction}>
              <input type="hidden" name="id_estado" value={estado.id_estado} />
              <button
                type="submit"
                className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}

        {estados.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay estados registrados todavía.
          </div>
        )}
      </div>
    </div>
  );
}

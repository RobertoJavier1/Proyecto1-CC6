import { getTiendas } from "@/lib/tiendas";
import Aviso from "../_components/aviso";
import {
  createTiendaAction,
  deleteTiendaAction,
  updateTiendaAction,
} from "./actions";

export default async function TiendasPage({
  searchParams,
}: PageProps<"/tiendas">) {
  const { error } = await searchParams;
  const tiendas = await getTiendas();

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Tiendas</h1>
        <p className="text-zinc-600">
          Tiendas virtuales que solicitan envíos por medio del webservice. El
          id es el que mandan en el parámetro <code>tienda</code>.
        </p>
      </div>

      <Aviso error={error} />

      <form
        action={createTiendaAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="id_tienda">
            Id
          </label>
          <input
            id="id_tienda"
            name="id_tienda"
            required
            maxLength={50}
            pattern="[A-Za-z0-9_\-]+"
            className="border rounded px-2 py-1 w-40 font-mono"
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
            maxLength={150}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar tienda
        </button>
      </form>

      <div className="flex flex-col">
        <div className="grid grid-cols-[140px_1fr_70px_80px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Id</div>
          <div>Nombre</div>
          <div>Órdenes</div>
          <div></div>
          <div></div>
        </div>

        {tiendas.map((tienda) => (
          <div
            key={tienda.id_tienda}
            className="grid grid-cols-[140px_1fr_70px_80px_80px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <div className="font-mono text-sm truncate" title={tienda.id_tienda}>
              {tienda.id_tienda}
            </div>

            <form action={updateTiendaAction} className="contents">
              <input type="hidden" name="id_tienda" value={tienda.id_tienda} />
              <input
                name="nombre"
                required
                maxLength={150}
                defaultValue={tienda.nombre}
                className="border rounded px-2 py-1 text-sm"
              />
              <div className="text-sm text-zinc-600">
                {tienda.total_ordenes}
              </div>
              <button
                type="submit"
                className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
              >
                Guardar
              </button>
            </form>

            <form action={deleteTiendaAction}>
              <input type="hidden" name="id_tienda" value={tienda.id_tienda} />
              <button
                type="submit"
                className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}

        {tiendas.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay tiendas registradas todavía.
          </div>
        )}
      </div>
    </div>
  );
}

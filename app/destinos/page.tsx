import { getDestinos } from "@/lib/destinos";
import {
  createDestinoAction,
  deleteDestinoAction,
  updateDestinoAction,
} from "./actions";

export default async function DestinosPage() {
  const destinos = await getDestinos();

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Destinos</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ciudades cubiertas y costo de envío por destino.
        </p>
      </div>

      <form
        action={createDestinoAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="codigo">
            Código (5)
          </label>
          <input
            id="codigo"
            name="codigo"
            maxLength={5}
            required
            className="border rounded px-2 py-1 w-24 uppercase dark:bg-black"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="nombre_ciudad">
            Ciudad
          </label>
          <input
            id="nombre_ciudad"
            name="nombre_ciudad"
            required
            className="border rounded px-2 py-1 dark:bg-black"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="costo_envio">
            Costo de envío
          </label>
          <input
            id="costo_envio"
            name="costo_envio"
            type="number"
            step="0.01"
            min="0"
            required
            className="border rounded px-2 py-1 w-32 dark:bg-black"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          Agregar destino
        </button>
      </form>

      <div className="flex flex-col">
        <div className="grid grid-cols-[80px_1fr_140px_80px_80px] gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <div>Código</div>
          <div>Ciudad</div>
          <div>Costo</div>
          <div></div>
          <div></div>
        </div>

        {destinos.map((destino) => (
          <div
            key={destino.codigo}
            className="grid grid-cols-[80px_1fr_140px_80px_80px] gap-3 items-center border-b border-zinc-100 dark:border-zinc-900 py-2"
          >
            <div className="font-mono text-sm">{destino.codigo}</div>

            <form
              id={`update-${destino.codigo}`}
              action={updateDestinoAction}
              className="contents"
            >
              <input type="hidden" name="codigo" value={destino.codigo} />
              <input
                name="nombre_ciudad"
                defaultValue={destino.nombre_ciudad}
                className="border rounded px-2 py-1 text-sm dark:bg-black"
              />
              <input
                name="costo_envio"
                type="number"
                step="0.01"
                min="0"
                defaultValue={destino.costo_envio}
                className="border rounded px-2 py-1 text-sm dark:bg-black"
              />
              <button
                type="submit"
                className="text-xs rounded border px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.08]"
              >
                Guardar
              </button>
            </form>

            <form action={deleteDestinoAction}>
              <input type="hidden" name="codigo" value={destino.codigo} />
              <button
                type="submit"
                className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}

        {destinos.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay destinos registrados todavía.
          </div>
        )}
      </div>
    </div>
  );
}

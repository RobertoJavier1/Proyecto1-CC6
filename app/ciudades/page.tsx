import { getCiudades } from "@/lib/ciudades";
import { getTarifas } from "@/lib/tarifas";
import {
  createCiudadAction,
  deleteCiudadAction,
  updateCiudadAction,
  createTarifaAction,
  deleteTarifaAction,
  updateTarifaAction,
} from "./actions";

export default async function CiudadesPage() {
  const [ciudades, tarifas] = await Promise.all([
    getCiudades(),
    getTarifas(),
  ]);

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 flex flex-col gap-12">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Ciudades</h1>
        <p className="text-zinc-600">
          Ciudades cubiertas por el courier.
        </p>
      </div>

      {/* crud de ciudades */}
      <section className="flex flex-col gap-4">
        <form
          action={createCiudadAction}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
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
              className="border rounded px-2 py-1 w-24 uppercase"
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
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Agregar ciudad
          </button>
        </form>

        <div className="flex flex-col">
          <div className="grid grid-cols-[80px_1fr_80px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
            <div>Código</div>
            <div>Ciudad</div>
            <div></div>
            <div></div>
          </div>

          {ciudades.map((ciudad) => (
            <div
              key={ciudad.codigo}
              className="grid grid-cols-[80px_1fr_80px_80px] gap-3 items-center border-b border-zinc-100 py-2"
            >
              <div className="font-mono text-sm">{ciudad.codigo}</div>

              <form
                id={`update-ciudad-${ciudad.codigo}`}
                action={updateCiudadAction}
                className="contents"
              >
                <input type="hidden" name="codigo" value={ciudad.codigo} />
                <input
                  name="nombre_ciudad"
                  defaultValue={ciudad.nombre_ciudad}
                  className="border rounded px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
                >
                  Guardar
                </button>
              </form>

              <form action={deleteCiudadAction}>
                <input type="hidden" name="codigo" value={ciudad.codigo} />
                <button
                  type="submit"
                  className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </form>
            </div>
          ))}

          {ciudades.length === 0 && (
            <div className="py-6 text-center text-zinc-500">
              No hay ciudades registradas todavía.
            </div>
          )}
        </div>
      </section>

      {/* crud de tarifas, cada fila es un par origen-destino con su precio */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-accent">Tarifas</h2>
          <p className="text-zinc-600">
            Costo de manejo y envío por cada par de ciudades.
          </p>
        </div>

        <form
          action={createTarifaAction}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="codigo_origen">
              Origen
            </label>
            <select
              id="codigo_origen"
              name="codigo_origen"
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="codigo_destino">
              Destino
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="precio">
              Precio
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              required
              className="border rounded px-2 py-1 w-32"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Agregar tarifa
          </button>
        </form>

        <div className="flex flex-col">
          <div className="grid grid-cols-[1fr_1fr_120px_80px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
            <div>Origen</div>
            <div>Destino</div>
            <div>Precio</div>
            <div></div>
            <div></div>
          </div>

          {tarifas.map((tarifa) => (
            <div
              key={`${tarifa.codigo_origen}-${tarifa.codigo_destino}`}
              className="grid grid-cols-[1fr_1fr_120px_80px_80px] gap-3 items-center border-b border-zinc-100 py-2"
            >
              <div className="text-sm">
                {tarifa.nombre_origen}{" "}
                <span className="text-zinc-500 font-mono text-xs">
                  ({tarifa.codigo_origen})
                </span>
              </div>
              <div className="text-sm">
                {tarifa.nombre_destino}{" "}
                <span className="text-zinc-500 font-mono text-xs">
                  ({tarifa.codigo_destino})
                </span>
              </div>

              <form
                id={`update-tarifa-${tarifa.codigo_origen}-${tarifa.codigo_destino}`}
                action={updateTarifaAction}
                className="contents"
              >
                <input
                  type="hidden"
                  name="codigo_origen"
                  value={tarifa.codigo_origen}
                />
                <input
                  type="hidden"
                  name="codigo_destino"
                  value={tarifa.codigo_destino}
                />
                <input
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tarifa.precio}
                  className="border rounded px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
                >
                  Guardar
                </button>
              </form>

              <form action={deleteTarifaAction}>
                <input
                  type="hidden"
                  name="codigo_origen"
                  value={tarifa.codigo_origen}
                />
                <input
                  type="hidden"
                  name="codigo_destino"
                  value={tarifa.codigo_destino}
                />
                <button
                  type="submit"
                  className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </form>
            </div>
          ))}

          {tarifas.length === 0 && (
            <div className="py-6 text-center text-zinc-500">
              No hay tarifas registradas todavía.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

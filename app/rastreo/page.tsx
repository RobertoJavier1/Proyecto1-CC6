import { getSeguimientoOrden } from "@/lib/ordenes";

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function RastreoPage({
  searchParams,
}: PageProps<"/rastreo">) {
  const { orden } = await searchParams;
  const texto = Array.isArray(orden) ? orden[0] : orden;

  let error = "";
  let resultado = null;
  if (texto) {
    const num_orden = Number(texto);
    if (!Number.isInteger(num_orden) || num_orden < 1) {
      error = "Ingrese un número de orden válido";
    } else {
      resultado = await getSeguimientoOrden(num_orden);
      if (!resultado) error = "No se encontró ninguna orden con ese número";
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-accent">
            Rastrear mi envío
          </h1>
          <p className="text-zinc-600 text-sm">
            Ingresa el número de orden que te dio la tienda.
          </p>
        </div>

        <form
          method="get"
          className="flex gap-2 border border-zinc-200 rounded-lg p-4 bg-white"
        >
          <input
            name="orden"
            defaultValue={texto ?? ""}
            required
            inputMode="numeric"
            placeholder="Número de orden"
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Buscar
          </button>
        </form>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {resultado && (
          <div className="flex flex-col gap-2 border border-zinc-200 rounded-lg p-4 bg-white text-sm">
            <div>
              <span className="text-zinc-500">Orden</span>{" "}
              <span className="font-mono">{resultado.num_orden}</span>
            </div>
            <div>
              <span className="text-zinc-500">Destino</span>{" "}
              {resultado.nombre_ciudad_destino} ({resultado.codigo_destino})
            </div>
            <div>
              <span className="text-zinc-500">Fecha</span>{" "}
              {formatFecha(resultado.fecha_creacion)}
            </div>
            <div>
              <span className="text-zinc-500">Estado</span>{" "}
              {resultado.id_estado}. {resultado.estado_nombre}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

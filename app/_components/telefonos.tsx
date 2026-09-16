import type { Telefono } from "@/lib/clientes";

// lista de telefonos con su form para agregar, se usa en clientes,
// destinatarios y mi cuenta. campo/valor es el id del dueño (hidden)
export default function Telefonos({
  telefonos,
  campo,
  valor,
  addAction,
  deleteAction,
}: {
  telefonos: Telefono[];
  campo: string;
  valor: number;
  addAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-accent">Teléfonos</h2>

      <form
        action={addAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
      >
        <input type="hidden" name={campo} value={valor} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="telefono">
            Nuevo teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            required
            maxLength={25}
            placeholder="5555-1234"
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar
        </button>
      </form>

      <div className="flex flex-col">
        {telefonos.map((tel) => (
          <div
            key={tel.id_telefono}
            className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2"
          >
            <span className="font-mono text-sm">{tel.telefono}</span>
            <form action={deleteAction}>
              <input type="hidden" name={campo} value={valor} />
              <input type="hidden" name="id_telefono" value={tel.id_telefono} />
              <button
                type="submit"
                className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
              >
                Quitar
              </button>
            </form>
          </div>
        ))}

        {telefonos.length === 0 && (
          <div className="py-4 text-center text-zinc-500 text-sm">
            Sin teléfonos registrados.
          </div>
        )}
      </div>
    </section>
  );
}

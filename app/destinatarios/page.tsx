import Link from "next/link";
import { getDestinatarios } from "@/lib/destinatarios";
import Aviso from "../_components/aviso";
import { createDestinatarioAction, deleteDestinatarioAction } from "./actions";

export default async function DestinatariosPage({
  searchParams,
}: PageProps<"/destinatarios">) {
  const { error, ok } = await searchParams;
  const destinatarios = await getDestinatarios();

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Destinatarios</h1>
        <p className="text-zinc-600">
          Personas que reciben los paquetes.
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      <form
        action={createDestinatarioAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
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
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            maxLength={25}
            className="border rounded px-2 py-1 w-36"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar destinatario
        </button>
      </form>

      <div className="flex flex-col">
        <div className="grid grid-cols-[60px_1fr_1fr_70px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Id</div>
          <div>Nombre</div>
          <div>Teléfonos</div>
          <div></div>
          <div></div>
        </div>

        {destinatarios.map((dest) => (
          <div
            key={dest.id_destinatario}
            className="grid grid-cols-[60px_1fr_1fr_70px_80px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <div className="font-mono text-sm">{dest.id_destinatario}</div>
            <div className="text-sm truncate" title={dest.nombre}>
              {dest.nombre}
            </div>
            <div className="text-sm text-zinc-600 truncate">
              {dest.telefonos.length > 0 ? (
                dest.telefonos.join(", ")
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </div>
            <Link
              href={`/destinatarios/${dest.id_destinatario}`}
              className="text-xs text-center rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
            >
              Editar
            </Link>
            <form action={deleteDestinatarioAction}>
              <input
                type="hidden"
                name="id_destinatario"
                value={dest.id_destinatario}
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

        {destinatarios.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay destinatarios registrados todavía.
          </div>
        )}
      </div>
    </div>
  );
}

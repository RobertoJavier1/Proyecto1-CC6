import Link from "next/link";
import { getClientes } from "@/lib/clientes";
import Aviso from "../_components/aviso";
import { createClienteAction, deleteClienteAction } from "./actions";

export default async function ClientesPage({
  searchParams,
}: PageProps<"/clientes">) {
  const { error, ok } = await searchParams;
  const clientes = await getClientes();

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Clientes</h1>
        <p className="text-zinc-600">
          Clientes individuales que contratan envíos. Inician sesión con su
          código.
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      <form
        action={createClienteAction}
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
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-sm font-medium" htmlFor="direccion">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            required
            maxLength={255}
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="contrasena">
            Contraseña
          </label>
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="border rounded px-2 py-1 w-36"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar cliente
        </button>
      </form>

      <div className="flex flex-col overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-[70px_1fr_1.3fr_1fr_70px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Código</div>
          <div>Nombre</div>
          <div>Dirección</div>
          <div>Teléfonos</div>
          <div></div>
          <div></div>
        </div>

        {clientes.map((cliente) => (
          <div
            key={cliente.id_cliente}
            className="min-w-[700px] grid grid-cols-[70px_1fr_1.3fr_1fr_70px_80px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <div className="font-mono text-sm">{cliente.id_cliente}</div>
            <div className="text-sm truncate" title={cliente.nombre}>
              {cliente.nombre}
            </div>
            <div className="text-sm truncate" title={cliente.direccion}>
              {cliente.direccion}
            </div>
            <div className="text-sm text-zinc-600 truncate">
              {cliente.telefonos.length > 0 ? (
                cliente.telefonos.join(", ")
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </div>
            <Link
              href={`/clientes/${cliente.id_cliente}`}
              className="text-xs text-center rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
            >
              Editar
            </Link>
            <form action={deleteClienteAction}>
              <input
                type="hidden"
                name="id_cliente"
                value={cliente.id_cliente}
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

        {clientes.length === 0 && (
          <div className="py-6 text-center text-zinc-500">
            No hay clientes registrados todavía.
          </div>
        )}
      </div>
    </div>
  );
}

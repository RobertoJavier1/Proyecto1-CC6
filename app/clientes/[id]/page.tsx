import Link from "next/link";
import { notFound } from "next/navigation";
import { getCliente, getTelefonosCliente } from "@/lib/clientes";
import Aviso from "../../_components/aviso";
import Telefonos from "../../_components/telefonos";
import {
  addTelefonoClienteAction,
  deleteTelefonoClienteAction,
  resetContrasenaClienteAction,
  updateClienteAction,
} from "../actions";

export default async function EditarClientePage({
  params,
  searchParams,
}: PageProps<"/clientes/[id]">) {
  const { id } = await params;
  const { error, ok } = await searchParams;

  const id_cliente = Number(id);
  if (!Number.isInteger(id_cliente)) notFound();

  const [cliente, telefonos] = await Promise.all([
    getCliente(id_cliente),
    getTelefonosCliente(id_cliente),
  ]);
  if (!cliente) notFound();

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-6 flex flex-col gap-10">
      <div>
        <Link href="/clientes" className="text-sm text-zinc-500 hover:text-accent">
          ← Clientes
        </Link>
        <h1 className="text-2xl font-semibold text-accent">{cliente.nombre}</h1>
        <p className="text-zinc-600">
          Código de cliente{" "}
          <span className="font-mono">{cliente.id_cliente}</span>
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-accent">Datos</h2>
        <form
          action={updateClienteAction}
          className="flex flex-col gap-3 border border-zinc-200 rounded-lg p-4"
        >
          <input type="hidden" name="id_cliente" value={cliente.id_cliente} />
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

      <Telefonos
        telefonos={telefonos}
        campo="id_cliente"
        valor={cliente.id_cliente}
        addAction={addTelefonoClienteAction}
        deleteAction={deleteTelefonoClienteAction}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-accent">Contraseña</h2>
        <form
          action={resetContrasenaClienteAction}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
        >
          <input type="hidden" name="id_cliente" value={cliente.id_cliente} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="contrasena">
              Nueva contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-accent text-accent px-4 py-2 text-sm font-medium hover:bg-accent/10"
          >
            Cambiar contraseña
          </button>
        </form>
      </section>
    </div>
  );
}

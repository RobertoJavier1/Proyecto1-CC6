import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDestinatario,
  getTelefonosDestinatario,
} from "@/lib/destinatarios";
import Aviso from "../../_components/aviso";
import Telefonos from "../../_components/telefonos";
import {
  addTelefonoDestinatarioAction,
  deleteTelefonoDestinatarioAction,
  updateDestinatarioAction,
} from "../actions";

export default async function EditarDestinatarioPage({
  params,
  searchParams,
}: PageProps<"/destinatarios/[id]">) {
  const { id } = await params;
  const { error, ok } = await searchParams;

  const id_destinatario = Number(id);
  if (!Number.isInteger(id_destinatario)) notFound();

  const [destinatario, telefonos] = await Promise.all([
    getDestinatario(id_destinatario),
    getTelefonosDestinatario(id_destinatario),
  ]);
  if (!destinatario) notFound();

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-6 flex flex-col gap-10">
      <div>
        <Link
          href="/destinatarios"
          className="text-sm text-zinc-500 hover:text-accent"
        >
          ← Destinatarios
        </Link>
        <h1 className="text-2xl font-semibold text-accent">
          {destinatario.nombre}
        </h1>
      </div>

      <Aviso error={error} ok={ok} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-accent">Datos</h2>
        <form
          action={updateDestinatarioAction}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
        >
          <input
            type="hidden"
            name="id_destinatario"
            value={destinatario.id_destinatario}
          />
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              maxLength={150}
              defaultValue={destinatario.nombre}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Guardar
          </button>
        </form>
      </section>

      <Telefonos
        telefonos={telefonos}
        campo="id_destinatario"
        valor={destinatario.id_destinatario}
        addAction={addTelefonoDestinatarioAction}
        deleteAction={deleteTelefonoDestinatarioAction}
      />
    </div>
  );
}

import { getAdministradores } from "@/lib/administradores";
import { getSesion } from "@/lib/auth";
import Aviso from "../_components/aviso";
import {
  createAdminAction,
  deleteAdminAction,
  resetContrasenaAdminAction,
  updateAdminAction,
} from "./actions";

export default async function AdministradoresPage({
  searchParams,
}: PageProps<"/administradores">) {
  const { error, ok } = await searchParams;
  const [admins, sesion] = await Promise.all([
    getAdministradores(),
    getSesion(),
  ]);

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-accent">Administradores</h1>
        <p className="text-zinc-600">
          Usuarios con acceso a las pantallas de mantenimiento.
        </p>
      </div>

      <Aviso error={error} ok={ok} />

      <form
        action={createAdminAction}
        className="flex flex-wrap items-end gap-3 border border-zinc-200 rounded-lg p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="usuario">
            Usuario
          </label>
          <input
            id="usuario"
            name="usuario"
            required
            maxLength={50}
            autoComplete="off"
            className="border rounded px-2 py-1"
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
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Agregar administrador
        </button>
      </form>

      <div className="flex flex-col overflow-x-auto">
        <div className="min-w-[640px] grid grid-cols-[1fr_80px_1fr_80px_80px] gap-3 border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-600">
          <div>Usuario</div>
          <div></div>
          <div>Nueva contraseña</div>
          <div></div>
          <div></div>
        </div>

        {admins.map((admin) => (
          <div
            key={admin.id_admin}
            className="min-w-[640px] grid grid-cols-[1fr_80px_1fr_80px_80px] gap-3 items-center border-b border-zinc-100 py-2"
          >
            <form action={updateAdminAction} className="contents">
              <input type="hidden" name="id_admin" value={admin.id_admin} />
              <input
                name="usuario"
                required
                maxLength={50}
                defaultValue={admin.usuario}
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
              >
                Guardar
              </button>
            </form>

            <form action={resetContrasenaAdminAction} className="contents">
              <input type="hidden" name="id_admin" value={admin.id_admin} />
              <input
                name="contrasena"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="text-xs rounded border border-accent text-accent px-2 py-1 hover:bg-accent/10"
              >
                Cambiar
              </button>
            </form>

            {admin.id_admin === sesion?.id ? (
              <span className="text-xs text-zinc-500 text-center">(usted)</span>
            ) : (
              <form action={deleteAdminAction}>
                <input type="hidden" name="id_admin" value={admin.id_admin} />
                <button
                  type="submit"
                  className="text-xs rounded border border-red-300 text-red-600 px-2 py-1 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

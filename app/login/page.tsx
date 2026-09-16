import Link from "next/link";
import Aviso from "../_components/aviso";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-accent">
            Iniciar sesión
          </h1>
          <p className="text-zinc-600 text-sm">
            Administradores con su usuario, clientes con su código de cliente.
          </p>
        </div>

        <Aviso error={error} />

        <form
          action={loginAction}
          className="flex flex-col gap-4 border border-zinc-200 rounded-lg p-6 bg-white"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="usuario">
              Usuario o código de cliente
            </label>
            <input
              id="usuario"
              name="usuario"
              required
              autoComplete="username"
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
              autoComplete="current-password"
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          ¿Compraste en una tienda y no tienes cuenta?{" "}
          <Link href="/rastreo" className="text-accent hover:underline">
            Rastrea tu pedido aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

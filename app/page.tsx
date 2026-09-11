import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          Courier — Entregas Rapiditas
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Administración de destinos cubiertos y seguimiento de los envíos
          contratados.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/ciudades"
            className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium"
          >
            Ciudades
          </Link>
          <Link
            href="/estados"
            className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 text-sm font-medium"
          >
            Estados
          </Link>
          <Link
            href="/ordenes"
            className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 text-sm font-medium"
          >
            Órdenes
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { LogOut } from "lucide-react";
import { getSesion } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

const LINKS_ADMIN = [
  { href: "/ciudades", label: "Ciudades" },
  { href: "/estados", label: "Estados" },
  { href: "/ordenes", label: "Órdenes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/destinatarios", label: "Destinatarios" },
  { href: "/tiendas", label: "Tiendas" },
  { href: "/administradores", label: "Administradores" },
];

const LINKS_CLIENTE = [{ href: "/mi-cuenta", label: "Mi cuenta" }];

export default async function Menu() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const links = sesion.rol === "admin" ? LINKS_ADMIN : LINKS_CLIENTE;

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-zinc-600 hover:text-accent"
        >
          {link.label}
        </Link>
      ))}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-zinc-500">
          {sesion.nombre}{" "}
          <span className="text-xs uppercase">
            ({sesion.rol === "admin" ? "admin" : "cliente"})
          </span>
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-600 hover:text-accent flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </form>
      </div>
    </>
  );
}

"use server";

import { redirect } from "next/navigation";
import { cerrarSesion, iniciarSesion } from "@/lib/auth";
import { getAdminParaLogin, guardarHashAdmin } from "@/lib/administradores";
import { getClienteParaLogin, guardarHashCliente } from "@/lib/clientes";
import { esTextoPlano, hashPassword, verifyPassword } from "@/lib/password";
import { fallar, texto } from "@/lib/errores";

const MSG_LOGIN = "Usuario o contraseña incorrectos";

// un solo formulario: primero se busca como administrador y si no existe
// y lo que escribio es un numero, se busca como codigo de cliente
export async function loginAction(formData: FormData) {
  const usuario = texto(formData, "usuario");
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!usuario || !contrasena) fallar("/login", "Ingrese usuario y contraseña");

  const admin = await getAdminParaLogin(usuario);
  if (admin) {
    if (!(await verifyPassword(contrasena, admin.contrasena))) {
      fallar("/login", MSG_LOGIN);
    }
    if (esTextoPlano(admin.contrasena)) {
      await guardarHashAdmin(admin.id_admin, await hashPassword(contrasena));
    }
    await iniciarSesion({
      rol: "admin",
      id: admin.id_admin,
      nombre: admin.usuario,
    });
    redirect("/");
  }

  if (/^\d{1,9}$/.test(usuario)) {
    const cliente = await getClienteParaLogin(Number(usuario));
    if (cliente && (await verifyPassword(contrasena, cliente.contrasena))) {
      if (esTextoPlano(cliente.contrasena)) {
        await guardarHashCliente(
          cliente.id_cliente,
          await hashPassword(contrasena),
        );
      }
      await iniciarSesion({
        rol: "cliente",
        id: cliente.id_cliente,
        nombre: cliente.nombre,
      });
      redirect("/mi-cuenta");
    }
  }

  fallar("/login", MSG_LOGIN);
}

export async function logoutAction() {
  await cerrarSesion();
  redirect("/login");
}

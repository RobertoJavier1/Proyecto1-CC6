import { redirect } from "next/navigation";

// en produccion next esconde el mensaje de los throw, por eso en estas
// pantallas el error se regresa en la url y se muestra arriba del formulario
export function fallar(ruta: string, mensaje: string): never {
  const sep = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${sep}error=${encodeURIComponent(mensaje)}`);
}

export function listo(ruta: string, mensaje: string): never {
  const sep = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${sep}ok=${encodeURIComponent(mensaje)}`);
}

// traduce los codigos de postgres mas comunes
export function mensajeBd(e: unknown, duplicado = "Ese registro ya existe") {
  const code = (e as { code?: string })?.code;
  if (code === "23505") return duplicado;
  if (code === "23503") return "No se puede, hay otros registros que dependen de este";
  if (code === "22001") return "Uno de los campos es demasiado largo";
  console.error(e);
  return "Ocurrió un error al guardar, intente de nuevo";
}

export const REGEX_TELEFONO = /^\+?[0-9][0-9 -]{6,23}$/;

export function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

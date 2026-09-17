"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createOrdenCliente, updateEstadoOrden } from "@/lib/ordenes";
import { createDestinatario } from "@/lib/destinatarios";
import { getTarifa } from "@/lib/tarifas";
import { REGEX_TELEFONO, fallar, listo, mensajeBd, texto } from "@/lib/errores";

const RUTA = "/ordenes";

// unica accion de esta pantalla, solo cambia el estado de una orden existente
export async function updateEstadoOrdenAction(formData: FormData) {
  await requireAdmin();
  const num_orden = Number(formData.get("num_orden"));
  const id_estado = Number(formData.get("id_estado"));

  if (!Number.isInteger(num_orden) || num_orden < 1) {
    throw new Error("Orden inválida");
  }
  if (!Number.isInteger(id_estado) || id_estado < 1) {
    throw new Error("Estado inválido");
  }

  await updateEstadoOrden(num_orden, id_estado);
  revalidatePath("/ordenes");
}

// el admin registra la orden a nombre de un cliente que ya tiene cuenta;
// el destinatario puede ser uno existente o uno nuevo capturado en el mismo formulario
export async function createOrdenAction(formData: FormData) {
  await requireAdmin();

  const id_cliente = Number(formData.get("id_cliente"));
  const id_destinatario_existente = String(formData.get("id_destinatario") ?? "");
  const nuevo_nombre = texto(formData, "nuevo_destinatario_nombre");
  const nuevo_telefono = texto(formData, "nuevo_destinatario_telefono");
  const direccion_entrega = texto(formData, "direccion_entrega");
  const codigo_destino = String(formData.get("codigo_destino") ?? "")
    .trim()
    .toUpperCase();

  if (!Number.isInteger(id_cliente) || id_cliente < 1) {
    fallar(RUTA, "Debe seleccionar un cliente");
  }
  if (!direccion_entrega) {
    fallar(RUTA, "La dirección de entrega es requerida");
  }
  if (!codigo_destino) {
    fallar(RUTA, "Debe seleccionar la ciudad de destino");
  }

  const codigo_origen = process.env.ORIGEN_COURIER;
  if (!codigo_origen) {
    fallar(
      RUTA,
      "Falta configurar la ciudad de origen del courier (variable ORIGEN_COURIER)",
    );
  }

  const tarifa = await getTarifa(codigo_origen, codigo_destino);
  if (!tarifa) {
    fallar(RUTA, "No hay tarifa registrada desde el origen a esa ciudad de destino");
  }

  let id_destinatario: number;
  if (id_destinatario_existente) {
    id_destinatario = Number(id_destinatario_existente);
  } else {
    if (!nuevo_nombre) {
      fallar(RUTA, "Seleccione un destinatario o ingrese el nombre de uno nuevo");
    }
    if (nuevo_telefono && !REGEX_TELEFONO.test(nuevo_telefono)) {
      fallar(RUTA, "El teléfono del destinatario no es válido");
    }
    id_destinatario = await createDestinatario(nuevo_nombre, nuevo_telefono || undefined);
  }

  let error = "";
  try {
    await createOrdenCliente({
      id_cliente,
      id_destinatario,
      direccion_entrega,
      codigo_origen,
      codigo_destino,
      costo_envio: tarifa.precio,
    });
  } catch (e) {
    error = mensajeBd(e, "No se pudo crear la orden");
  }
  if (error) fallar(RUTA, error);

  revalidatePath(RUTA);
  listo(RUTA, "Orden creada correctamente");
}

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

// se guarda como scrypt$salt$hash para no depender de otra libreria
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, guardada: string) {
  if (!guardada.startsWith("scrypt$")) {
    // registros metidos a mano en la bd con la contraseña en texto plano
    const a = Buffer.from(password);
    const b = Buffer.from(guardada);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const [, salt, hashHex] = guardada.split("$");
  const esperado = Buffer.from(hashHex, "hex");
  const hash = await scryptAsync(password, salt, esperado.length);
  return timingSafeEqual(hash, esperado);
}

export function esTextoPlano(guardada: string) {
  return !guardada.startsWith("scrypt$");
}

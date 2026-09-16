// muestra el ?error= o ?ok= que dejan las server actions al redirigir
export default function Aviso({
  error,
  ok,
}: {
  error?: string | string[];
  ok?: string | string[];
}) {
  const e = Array.isArray(error) ? error[0] : error;
  const o = Array.isArray(ok) ? ok[0] : ok;

  if (e) {
    return (
      <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
        {e}
      </div>
    );
  }
  if (o) {
    return (
      <div className="rounded border border-green-300 bg-green-50 text-green-700 px-4 py-2 text-sm">
        {o}
      </div>
    );
  }
  return null;
}

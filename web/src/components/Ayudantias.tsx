"use client";

import { avax, contrato, corta, linkDir, mismo } from "@/lib/util";
import { TxEstado, useTx } from "./Tx";

export type Ayudantia = {
  id: bigint;
  ayudante: `0x${string}`;
  profesor: `0x${string}`;
  curso: string;
  ubsMensuales: bigint;
  mesesTotales: bigint;
  mesesPagados: bigint;
};

type Props = {
  lista: Ayudantia[];
  valorUB?: bigint;
  cuenta?: `0x${string}`;
  deshabilitado: boolean;
};

export function TablaAyudantias({ lista, valorUB, cuenta, deshabilitado }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Ayudantías registradas</h2>
      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Aún no hay ayudantías. La administración puede registrar la primera.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((a) => (
            <Fila key={a.id.toString()} a={a} valorUB={valorUB} cuenta={cuenta} deshabilitado={deshabilitado} />
          ))}
        </div>
      )}
    </section>
  );
}

function Persona({ etiqueta, dir, esTu }: { etiqueta: string; dir: string; esTu: boolean }) {
  return (
    <div className="text-sm">
      <span className="text-slate-500">{etiqueta}: </span>
      <a href={linkDir(dir)} target="_blank" rel="noreferrer" className="font-mono underline">
        {corta(dir)}
      </a>
      {esTu && <span className="ml-1 rounded bg-indigo-100 px-1.5 text-xs text-indigo-700">tú</span>}
    </div>
  );
}

function Fila({ a, valorUB, cuenta, deshabilitado }: { a: Ayudantia } & Omit<Props, "lista">) {
  const tx = useTx();
  const soyProfesor = mismo(cuenta, a.profesor);
  const soyAyudante = mismo(cuenta, a.ayudante);
  const completa = a.mesesPagados >= a.mesesTotales;
  const pagoMes = valorUB === undefined ? undefined : a.ubsMensuales * valorUB;
  const avance = Number((a.mesesPagados * 100n) / a.mesesTotales);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-4 ${
        soyProfesor || soyAyudante ? "border-indigo-300 ring-1 ring-indigo-200" : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">Ayudantía #{a.id.toString()}</div>
          <div className="font-semibold">{a.curso}</div>
        </div>
        <div className="text-right text-sm">
          <div>
            <b>{a.ubsMensuales.toString()} UBs</b>/mes · {avax(pagoMes)}/mes
          </div>
          <div className="text-slate-500">
            {a.mesesPagados.toString()} de {a.mesesTotales.toString()} meses pagados
          </div>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${avance}%` }} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <Persona etiqueta="Ayudante" dir={a.ayudante} esTu={soyAyudante} />
        <Persona etiqueta="Profesor" dir={a.profesor} esTu={soyProfesor} />
      </div>

      {soyProfesor && (!completa || tx.write.data) && (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
          {!completa && <button
            disabled={deshabilitado || tx.ocupado}
            onClick={() => tx.write.mutate({ ...contrato, functionName: "confirmarMes", args: [a.id] })}
            className="self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Confirmar mes {(a.mesesPagados + 1n).toString()} y pagar {avax(pagoMes)}
          </button>}
          <TxEstado tx={tx} />
        </div>
      )}
      {completa && <p className="text-sm text-emerald-700">✅ Ayudantía pagada completa.</p>}
    </div>
  );
}

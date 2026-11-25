"use client";

import { useState, type ReactNode } from "react";
import { formatEther, isAddress, parseEther } from "viem";
import { contrato } from "@/lib/util";
import { TxEstado, useTx } from "./Tx";

// Direcciones públicas de las cuentas de prueba del equipo (para la demo).
const DEMO = {
  ayudante: "0xA4501078b5109e88F5D640BB83360541c61e0838",
  profesor: "0xDCE0728BdC2e00515d3CCA3e2807142A804392F8",
  curso: "IN3863 Aplicaciones de Blockchain",
  ubs: "10",
  meses: "4",
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";
const boton =
  "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50";

function Tarjeta({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h3 className="font-semibold">{titulo}</h3>
        <p className="text-xs text-slate-500">{ayuda}</p>
      </div>
      {children}
    </div>
  );
}

const aWei = (texto: string) => {
  try {
    const v = parseEther(texto.replace(",", "."));
    return v > 0n ? v : undefined;
  } catch {
    return undefined;
  }
};

export function PanelAdmin({ deshabilitado, sobrante }: { deshabilitado: boolean; sobrante?: bigint }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Panel de administración</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Depositar deshabilitado={deshabilitado} />
        <FijarValor deshabilitado={deshabilitado} />
        <Registrar deshabilitado={deshabilitado} />
        <Retirar deshabilitado={deshabilitado} sobrante={sobrante} />
      </div>
    </section>
  );
}

function Depositar({ deshabilitado }: { deshabilitado: boolean }) {
  const [monto, setMonto] = useState("0.05");
  const tx = useTx();
  const wei = aWei(monto);
  return (
    <Tarjeta titulo="1 · Depositar presupuesto" ayuda="Carga AVAX al contrato para pagar ayudantías.">
      <div className="flex gap-2">
        <input className={input} value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="AVAX" />
        <button
          className={boton}
          disabled={deshabilitado || !wei || tx.ocupado}
          onClick={() => tx.write.mutate({ ...contrato, functionName: "depositarPresupuesto", value: wei })}
        >
          Depositar
        </button>
      </div>
      <TxEstado tx={tx} />
    </Tarjeta>
  );
}

function FijarValor({ deshabilitado }: { deshabilitado: boolean }) {
  const [valor, setValor] = useState("0.001");
  const tx = useTx();
  const wei = aWei(valor);
  return (
    <Tarjeta titulo="2 · Fijar valor UB" ayuda="AVAX por cada UB. Rige para los meses que se confirmen desde ahora.">
      <div className="flex gap-2">
        <input className={input} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="AVAX por UB" />
        <button
          className={boton}
          disabled={deshabilitado || !wei || tx.ocupado}
          onClick={() => wei && tx.write.mutate({ ...contrato, functionName: "fijarValorUB", args: [wei] })}
        >
          Fijar
        </button>
      </div>
      <TxEstado tx={tx} />
    </Tarjeta>
  );
}

function Registrar({ deshabilitado }: { deshabilitado: boolean }) {
  const [f, setF] = useState({ ayudante: "", profesor: "", curso: "", ubs: "", meses: "" });
  const tx = useTx();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  const ubs = /^\d+$/.test(f.ubs) ? BigInt(f.ubs) : 0n;
  const meses = /^\d+$/.test(f.meses) ? BigInt(f.meses) : 0n;
  const valido =
    isAddress(f.ayudante) && isAddress(f.profesor) && f.curso.trim() !== "" && ubs > 0n && meses > 0n && meses <= 12n;

  return (
    <Tarjeta titulo="3 · Registrar ayudantía" ayuda="Ayudante, profesor, curso, UBs al mes y número de meses (1 a 12).">
      <input className={input} value={f.ayudante} onChange={set("ayudante")} placeholder="Dirección del ayudante (0x…)" />
      <input className={input} value={f.profesor} onChange={set("profesor")} placeholder="Dirección del profesor (0x…)" />
      <input className={input} value={f.curso} onChange={set("curso")} placeholder="Curso" />
      <div className="flex gap-2">
        <input className={input} value={f.ubs} onChange={set("ubs")} placeholder="UBs mensuales" />
        <input className={input} value={f.meses} onChange={set("meses")} placeholder="Meses" />
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          onClick={() => setF(DEMO)}
          type="button"
        >
          Rellenar ejemplo
        </button>
        <button
          className={boton}
          disabled={deshabilitado || !valido || tx.ocupado}
          onClick={() =>
            tx.write.mutate({
              ...contrato,
              functionName: "registrarAyudantia",
              args: [f.ayudante as `0x${string}`, f.profesor as `0x${string}`, f.curso.trim(), ubs, meses],
            })
          }
        >
          Registrar
        </button>
      </div>
      <TxEstado tx={tx} />
    </Tarjeta>
  );
}

function Retirar({ deshabilitado, sobrante }: { deshabilitado: boolean; sobrante?: bigint }) {
  const [monto, setMonto] = useState("");
  const tx = useTx();
  const wei = aWei(monto);
  return (
    <Tarjeta
      titulo="5 · Retirar sobrante"
      ayuda="Solo se puede retirar lo que NO está comprometido con meses pendientes."
    >
      <div className="flex gap-2">
        <input className={input} value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="AVAX" />
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          onClick={() => sobrante !== undefined && setMonto(formatEther(sobrante))}
        >
          Máximo
        </button>
        <button
          className={boton}
          disabled={deshabilitado || !wei || tx.ocupado}
          onClick={() => wei && tx.write.mutate({ ...contrato, functionName: "retirarSobrante", args: [wei] })}
        >
          Retirar
        </button>
      </div>
      <TxEstado tx={tx} />
    </Tarjeta>
  );
}

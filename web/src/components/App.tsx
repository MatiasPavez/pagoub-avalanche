"use client";

import { useConnection, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, fuji } from "@/lib/config";
import { avax, contrato, corta, linkDir, mismo } from "@/lib/util";
import { TablaAyudantias, type Ayudantia } from "./Ayudantias";
import { AvisoRed, BotonConexion } from "./Conexion";
import { PanelAdmin } from "./PanelAdmin";

const REFRESCO = { refetchInterval: 8000 }; // relee el contrato cada 8 s

export default function App() {
  if (!CONTRACT_ADDRESS)
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          Falta configurar <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> con la dirección del contrato.
        </p>
      </main>
    );
  return <Pantalla />;
}

function Pantalla() {
  const { address, isConnected, chainId } = useConnection();
  const enFuji = isConnected && chainId === fuji.id;

  // Lecturas gratuitas: no requieren wallet ni gas.
  const resumen = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...contrato, functionName: "administracion" },
      { ...contrato, functionName: "valorUB" },
      { ...contrato, functionName: "saldo" },
      { ...contrato, functionName: "presupuestoComprometido" },
      { ...contrato, functionName: "sobranteDisponible" },
      { ...contrato, functionName: "totalAyudantias" },
    ],
    query: REFRESCO,
  });
  const [administracion, valorUB, saldo, comprometido, sobrante, total] = resumen.data ?? [];

  const ids = Array.from({ length: Number(total ?? 0n) }, (_, i) => BigInt(i));
  const detalle = useReadContracts({
    allowFailure: false,
    contracts: ids.map((id) => ({ ...contrato, functionName: "ayudantias" as const, args: [id] as const })),
    query: { ...REFRESCO, enabled: ids.length > 0 },
  });
  const lista: Ayudantia[] = (detalle.data ?? []).map(
    ([ayudante, profesor, curso, ubsMensuales, mesesTotales, mesesPagados], i) => ({
      id: ids[i],
      ayudante,
      profesor,
      curso,
      ubsMensuales,
      mesesTotales,
      mesesPagados,
    }),
  );

  const esAdmin = mismo(address, administracion);
  const esProfesor = lista.some((a) => mismo(address, a.profesor));
  const esAyudante = lista.some((a) => mismo(address, a.ayudante));
  const rol = !isConnected
    ? "Sin conectar"
    : [esAdmin && "Administración", esProfesor && "Profesor", esAyudante && "Ayudante"].filter(Boolean).join(" · ") ||
      "Visitante";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PagoUB</h1>
          <p className="text-sm text-slate-600">
            Pago automático de Unidades Becarias a ayudantes · Avalanche Fuji
          </p>
          <a
            href={linkDir(CONTRACT_ADDRESS!)}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-indigo-700 underline"
          >
            Contrato {corta(CONTRACT_ADDRESS)} en Snowtrace ↗
          </a>
        </div>
        <BotonConexion />
      </header>

      <AvisoRed />

      {isConnected && (
        <p className="text-sm">
          Conectado como: <b>{rol}</b>
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Dato titulo="Valor UB" valor={avax(valorUB, 6)} />
        <Dato titulo="Saldo del contrato" valor={avax(saldo)} />
        <Dato titulo="Comprometido" valor={avax(comprometido)} ayuda="Reservado para meses pendientes" />
        <Dato titulo="Sobrante" valor={avax(sobrante)} ayuda="Lo que la administración puede retirar" />
      </section>
      {resumen.error && <p className="text-sm text-red-700">No se pudo leer el contrato: {resumen.error.message}</p>}

      {esAdmin && <PanelAdmin deshabilitado={!enFuji} sobrante={sobrante} />}

      <TablaAyudantias lista={lista} valorUB={valorUB} cuenta={address} deshabilitado={!enFuji} />

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <b>Cómo funciona:</b> la administración deposita el presupuesto y registra cada ayudantía → el profesor
        asignado confirma el mes → el contrato paga <b>UBs × valor UB</b> al ayudante en la misma transacción. Nadie
        puede pagar dos veces el mismo mes, pasarse de los meses pactados ni retirar lo comprometido.
      </footer>
    </main>
  );
}

function Dato({ titulo, valor, ayuda }: { titulo: string; valor: string; ayuda?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{titulo}</div>
      <div className="text-lg font-semibold">{valor}</div>
      {ayuda && <div className="text-xs text-slate-400">{ayuda}</div>}
    </div>
  );
}

"use client";

import { useBalance, useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { fuji } from "@/lib/config";
import { avax, corta } from "@/lib/util";

// Botón para conectar la wallet (Core, MetaMask u otra del navegador).
export function BotonConexion() {
  const { address, isConnected } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const { data: saldo } = useBalance({ address, chainId: fuji.id });

  if (isConnected)
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-sm">{corta(address)}</div>
          <div className="text-xs text-slate-500">{avax(saldo?.value)}</div>
        </div>
        <button
          onClick={() => disconnect.mutate()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Desconectar
        </button>
      </div>
    );

  // Si el navegador anuncia wallets específicas (Core, MetaMask), se muestran esas.
  const especificas = connectors.filter((c) => c.id !== "injected");
  const lista = especificas.length > 0 ? especificas : connectors;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {lista.map((c) => (
          <button
            key={c.uid}
            onClick={() => connect.mutate({ connector: c, chainId: fuji.id })}
            disabled={connect.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {lista.length > 1 ? `Conectar ${c.name}` : "Conectar wallet"}
          </button>
        ))}
      </div>
      {connect.error && <p className="text-xs text-red-700">{connect.error.message}</p>}
    </div>
  );
}

// Aviso si la wallet está en una red distinta de Fuji.
export function AvisoRed() {
  const { isConnected, chainId } = useConnection();
  const switchChain = useSwitchChain();
  if (!isConnected || chainId === fuji.id) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm text-amber-900">
        ⚠️ Tu wallet está en otra red (Chain ID {chainId}). Esta app funciona solo en{" "}
        <b>Avalanche Fuji (43113)</b>.
      </p>
      <button
        onClick={() => switchChain.mutate({ chainId: fuji.id })}
        disabled={switchChain.isPending}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        Cambiar a Fuji
      </button>
    </div>
  );
}

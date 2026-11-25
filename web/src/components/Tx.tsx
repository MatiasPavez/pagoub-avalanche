"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { BaseError } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { fuji } from "@/lib/config";
import { linkTx } from "@/lib/util";

// Envía una transacción, espera que la red la confirme y luego refresca los datos.
export function useTx() {
  const queryClient = useQueryClient();
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data, chainId: fuji.id });

  useEffect(() => {
    if (receipt.isSuccess) queryClient.invalidateQueries();
  }, [receipt.isSuccess, queryClient]);

  const ocupado = write.isPending || (!!write.data && receipt.isLoading);
  return { write, receipt, ocupado };
}

// Muestra en qué va la transacción y el enlace a Snowtrace.
export function TxEstado({ tx }: { tx: ReturnType<typeof useTx> }) {
  const { write, receipt } = tx;

  if (write.isPending)
    return <p className="text-sm text-amber-700">✍️ Confirma la transacción en tu wallet…</p>;

  if (write.error)
    return (
      <p className="text-sm text-red-700 break-words">
        ❌ {(write.error as BaseError).shortMessage ?? write.error.message}
      </p>
    );

  if (!write.data) return null;

  const enlace = (
    <a href={linkTx(write.data)} target="_blank" rel="noreferrer" className="underline font-mono">
      {write.data.slice(0, 10)}…{write.data.slice(-8)}
    </a>
  );

  if (receipt.isLoading)
    return <p className="text-sm text-slate-600">⏳ Esperando a la red Fuji… {enlace}</p>;

  if (receipt.data?.status === "success")
    return <p className="text-sm text-emerald-700">✅ Confirmada en Snowtrace: {enlace}</p>;

  return <p className="text-sm text-red-700">❌ La transacción falló: {enlace}</p>;
}

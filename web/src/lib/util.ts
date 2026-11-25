import { formatEther } from "viem";
import { pagoUBAbi } from "./abi";
import { CONTRACT_ADDRESS, fuji, SNOWTRACE } from "./config";

// Datos comunes a toda llamada al contrato: dirección, ABI y red.
export const contrato = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: pagoUBAbi,
  chainId: fuji.id,
} as const;

export const corta = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

export const mismo = (a?: string, b?: string) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

export const avax = (wei?: bigint, decimales = 4) =>
  wei === undefined
    ? "…"
    : `${Number(formatEther(wei)).toLocaleString("es-CL", { maximumFractionDigits: decimales })} AVAX`;

export const linkTx = (hash: string) => `${SNOWTRACE}/tx/${hash}`;
export const linkDir = (dir: string) => `${SNOWTRACE}/address/${dir}`;

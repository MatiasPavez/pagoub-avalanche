import { createConfig, http } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { isAddress } from "viem";

// Fuji C-Chain (43113). Mainnet sería 43114: esta app solo trabaja en Fuji.
export const fuji = avalancheFuji;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? fuji.id);

// La dirección del contrato viene de una variable de entorno (Paso 8 de la guía).
const direccion = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
export const CONTRACT_ADDRESS = isAddress(direccion) ? direccion : undefined;

export const SNOWTRACE = "https://testnet.snowtrace.io";

export const wagmiConfig = createConfig({
  chains: [fuji],
  connectors: [injected()],
  transports: { [fuji.id]: http() },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

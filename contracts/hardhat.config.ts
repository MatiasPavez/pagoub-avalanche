import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.34",
        // Avalanche C-Chain tiene activado Cancun (ACP-131). Compilamos para
        // esa versión en vez de "osaka", que Avalanche no ha confirmado.
        settings: { evmVersion: "cancun" },
      },
      production: {
        version: "0.8.34",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  // Snowtrace (testnet) usa la API de Routescan para verificar código fuente.
  chainDescriptors: {
    43113: {
      name: "Avalanche Fuji",
      blockExplorers: {
        etherscan: {
          name: "Snowtrace",
          url: "https://testnet.snowtrace.io",
          apiUrl: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
        },
      },
    },
  },
  verify: {
    // Routescan no exige una API key real; este valor es público, no es un secreto.
    etherscan: { apiKey: "verifyContract" },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    // Avalanche Fuji C-Chain (testnet). Mainnet sería 43114: NO usar.
    fuji: {
      type: "http",
      chainType: "l1",
      chainId: 43113,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      // La clave se lee del almacén cifrado de Hardhat, nunca de este archivo.
      accounts: [configVariable("FUJI_PRIVATE_KEY")],
    },
  },
});

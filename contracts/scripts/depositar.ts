// Deposita presupuesto en el contrato PagoUB desplegado en Fuji.
// Uso: npx hardhat run scripts/depositar.ts --network fuji
// Monto opcional (en AVAX): $env:MONTO_AVAX="0.05"; npx hardhat run ...
import { readFileSync } from "node:fs";
import { network } from "hardhat";
import { formatEther, parseEther } from "viem";

const desplegado = JSON.parse(
  readFileSync("ignition/deployments/chain-43113/deployed_addresses.json", "utf8"),
);
const direccion = desplegado["PagoUBModule#PagoUB"] as `0x${string}`;
const monto = parseEther(process.env.MONTO_AVAX ?? "0.1");

const { viem } = await network.connect();
const publicClient = await viem.getPublicClient();
const chainId = await publicClient.getChainId();
if (chainId !== 43113) throw new Error(`Red equivocada (chainId ${chainId}). Usa --network fuji`);

const pago = await viem.getContractAt("PagoUB", direccion);
console.log(`Depositando ${formatEther(monto)} AVAX en ${direccion}...`);

const hash = await pago.write.depositarPresupuesto({ value: monto });
const recibo = await publicClient.waitForTransactionReceipt({ hash });

console.log(`Estado: ${recibo.status === "success" ? "Success ✅" : "Falló ❌"}`);
console.log(`Transacción: https://testnet.snowtrace.io/tx/${hash}`);
console.log(`Saldo del contrato: ${formatEther(await pago.read.saldo())} AVAX`);

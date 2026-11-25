import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

// Despliega PagoUB con 1 UB = 0,001 AVAX.
// La cuenta que despliega queda como "administracion" del contrato.
export default buildModule("PagoUBModule", (m) => {
  const valorUBInicial = m.getParameter("valorUBInicial", parseEther("0.001"));
  const pagoUB = m.contract("PagoUB", [valorUBInicial]);
  return { pagoUB };
});

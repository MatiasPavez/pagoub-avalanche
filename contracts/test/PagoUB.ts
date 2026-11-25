import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { parseEther } from "viem";

const VALOR_UB = parseEther("0.001"); // 1 UB = 0,001 AVAX

describe("PagoUB", async function () {
  const { viem, networkHelpers } = await network.create();
  const [admin, profesor, ayudante, otro] = await viem.getWalletClients();

  // Escenario base: contrato desplegado, 1 AVAX de presupuesto y una
  // ayudantía de 10 UBs mensuales por 4 meses.
  async function escenarioBase() {
    const pago = await viem.deployContract("PagoUB", [VALOR_UB]);
    await pago.write.depositarPresupuesto({ value: parseEther("1") });
    await pago.write.registrarAyudantia([
      ayudante.account.address,
      profesor.account.address,
      "IN3863 Blockchain",
      10n,
      4n,
    ]);
    return { pago };
  }

  it("Registra la ayudantía con sus datos", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    const [ay, prof, curso, ubs, meses, pagados] = await pago.read.ayudantias([0n]);
    assert.equal(ay.toLowerCase(), ayudante.account.address.toLowerCase());
    assert.equal(prof.toLowerCase(), profesor.account.address.toLowerCase());
    assert.equal(curso, "IN3863 Blockchain");
    assert.equal(ubs, 10n);
    assert.equal(meses, 4n);
    assert.equal(pagados, 0n);
    assert.equal(await pago.read.totalAyudantias(), 1n);
    assert.equal(await pago.read.presupuestoComprometido(), 40n * VALOR_UB);
  });

  it("Al confirmar el mes, paga UBs × valor UB al ayudante", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    const monto = 10n * VALOR_UB; // 0,01 AVAX

    await viem.assertions.balancesHaveChanged(
      pago.write.confirmarMes([0n], { account: profesor.account }),
      [
        { address: ayudante.account.address, amount: monto },
        { address: pago.address, amount: -monto },
      ],
    );
    const [, , , , , pagados] = await pago.read.ayudantias([0n]);
    assert.equal(pagados, 1n);
  });

  it("Emite el evento MesConfirmado", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    await viem.assertions.emitWithArgs(
      pago.write.confirmarMes([0n], { account: profesor.account }),
      pago,
      "MesConfirmado",
      [0n, ayudante.account.address, 1n, 10n, 10n * VALOR_UB],
    );
  });

  it("Usa el valor UB vigente al momento de confirmar", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    const nuevoValor = parseEther("0.002");
    await pago.write.fijarValorUB([nuevoValor]);

    await viem.assertions.balancesHaveChanged(
      pago.write.confirmarMes([0n], { account: profesor.account }),
      [{ address: ayudante.account.address, amount: 10n * nuevoValor }],
    );
  });

  it("Solo el profesor asignado puede confirmar", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    for (const cuenta of [otro, ayudante, admin]) {
      await viem.assertions.revertWith(
        pago.write.confirmarMes([0n], { account: cuenta.account }),
        "Solo el profesor de la ayudantia",
      );
    }
  });

  it("No paga más meses que los pactados", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    for (let i = 0; i < 4; i++) {
      await pago.write.confirmarMes([0n], { account: profesor.account });
    }
    await viem.assertions.revertWith(
      pago.write.confirmarMes([0n], { account: profesor.account }),
      "Ayudantia ya pagada completa",
    );
    assert.equal(await pago.read.ubsPendientes(), 0n);
  });

  it("Rechaza el pago completo si no hay presupuesto suficiente", async function () {
    const pago = await viem.deployContract("PagoUB", [VALOR_UB]);
    await pago.write.depositarPresupuesto({ value: 5n * VALOR_UB }); // alcanza para 5 UBs
    await pago.write.registrarAyudantia([
      ayudante.account.address,
      profesor.account.address,
      "IN3863",
      10n,
      1n,
    ]);
    await viem.assertions.revertWith(
      pago.write.confirmarMes([0n], { account: profesor.account }),
      "Presupuesto insuficiente",
    );
  });

  it("Solo la administración deposita, fija valor y registra", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    const comoOtro = { account: otro.account };
    await viem.assertions.revertWith(
      pago.write.depositarPresupuesto({ ...comoOtro, value: 1n }),
      "Solo la administracion",
    );
    await viem.assertions.revertWith(
      pago.write.fijarValorUB([1n], comoOtro),
      "Solo la administracion",
    );
    await viem.assertions.revertWith(
      pago.write.registrarAyudantia(
        [ayudante.account.address, profesor.account.address, "X", 1n, 1n],
        comoOtro,
      ),
      "Solo la administracion",
    );
    await viem.assertions.revertWith(
      pago.write.retirarSobrante([1n], comoOtro),
      "Solo la administracion",
    );
  });

  it("Valida los datos de la ayudantía", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    const a = ayudante.account.address;
    const p = profesor.account.address;
    await viem.assertions.revertWith(
      pago.write.registrarAyudantia([a, p, "X", 0n, 4n]),
      "UBs mensuales debe ser mayor a 0",
    );
    await viem.assertions.revertWith(
      pago.write.registrarAyudantia([a, p, "X", 10n, 0n]),
      "Meses entre 1 y 12",
    );
    await viem.assertions.revertWith(
      pago.write.registrarAyudantia([a, a, "X", 10n, 4n]),
      "Ayudante y profesor deben ser distintos",
    );
    await viem.assertions.revertWith(
      pago.write.confirmarMes([99n], { account: profesor.account }),
      "Ayudantia no existe",
    );
  });

  it("La administración solo puede retirar lo no comprometido", async function () {
    const { pago } = await networkHelpers.loadFixture(escenarioBase);
    // 1 AVAX depositado, 40 UBs comprometidas = 0,04 AVAX -> sobrante 0,96 AVAX
    const sobrante = parseEther("1") - 40n * VALOR_UB;
    assert.equal(await pago.read.sobranteDisponible(), sobrante);

    await viem.assertions.revertWith(
      pago.write.retirarSobrante([sobrante + 1n]),
      "Monto supera el sobrante",
    );
    await viem.assertions.emitWithArgs(
      pago.write.retirarSobrante([sobrante]),
      pago,
      "SobranteRetirado",
      [admin.account.address, sobrante],
    );
    // Lo comprometido sigue intacto: el ayudante puede cobrar sus 4 meses.
    for (let i = 0; i < 4; i++) {
      await pago.write.confirmarMes([0n], { account: profesor.account });
    }
    assert.equal(await pago.read.saldo(), 0n);
  });
});

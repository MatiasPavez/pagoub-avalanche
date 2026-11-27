# PagoUB: pago automático de Unidades Becarias en Avalanche

Prototipo para el hackathon **Chile Team1 Avalanche** (curso IN3863, Aplicaciones de Blockchain y Criptomonedas, Universidad de Chile).

> **Los profesores pueden confirmar el trabajo mensual de sus ayudantes, y el contrato garantiza que cada ayudante reciba automáticamente UBs × valor UB, una sola vez por mes y solo hasta los meses pactados, sin depender de que un tercero procese el pago.**

| | |
| --- | --- |
| **Demo** | _(URL de Vercel: pendiente)_ |
| **Contrato (Fuji C-Chain, 43113)** | [`0xF9F0Ddae0b7710A9Ff8C3d8622b1A543C6FC4907`](https://testnet.snowtrace.io/address/0xF9F0Ddae0b7710A9Ff8C3d8622b1A543C6FC4907#code) (código verificado) |
| Depósito de presupuesto | [`0x79e1…d9cf`](https://testnet.snowtrace.io/tx/0x79e1cd15ccfa2ec6bce0a90dd3c3ee97d36af86bdcdbbde7d7ee0f150049d9cf) |
| Registro de ayudantía | [`0x60e0…0ee7`](https://testnet.snowtrace.io/tx/0x60e06f4c814610a12e7fdb06bbb2076e8c37dfcab8870e462830a96816570ee7) |
| Profesor confirma el mes 1 → pago automático | [`0xa829…e3b7`](https://testnet.snowtrace.io/tx/0xa82983dc6cb1049d2c25d116ca4667130fcff3a4c5ed24144268752fe01ae3b7) |

## El problema

El pago de UBs a ayudantes depende hoy de una cadena de pasos administrativos: el profesor informa, alguien consolida y otro procesa el pago. Los atrasos y errores los paga el ayudante, que no tiene cómo verificar en qué va su pago.

## La solución

Un contrato inteligente que funciona como una **caja fuerte con el reglamento grabado en la puerta**:

1. **La administración** deposita el presupuesto, fija el valor de la UB y registra cada ayudantía (ayudante, profesor, curso, UBs mensuales y número de meses).
2. **El profesor asignado** confirma el mes trabajado.
3. **El contrato paga** en la misma transacción `UBs mensuales × valor UB` al ayudante.

Cualquiera puede auditar cada pago en Snowtrace.

### Reglas que el contrato garantiza

- Solo la administración puede depositar, fijar el valor UB, registrar ayudantías y retirar sobrante.
- Solo **el profesor de esa ayudantía** puede confirmar sus meses.
- Cada mes se paga una sola vez y nunca más de los meses pactados.
- Si no hay presupuesto suficiente, el pago se rechaza completo (nunca a medias).
- La administración **solo puede retirar lo que no está comprometido** con meses pendientes, así que no puede vaciar la caja dejando ayudantes sin pagar.
- El pago usa el valor UB vigente al momento de confirmar.

### Funciones del contrato (`contracts/contracts/PagoUB.sol`)

| Función | Quién | Qué hace |
| --- | --- | --- |
| `depositarPresupuesto()` | Administración | Carga AVAX al contrato |
| `fijarValorUB(nuevoValor)` | Administración | Cambia el valor de 1 UB (en wei) |
| `registrarAyudantia(ayudante, profesor, curso, ubsMensuales, meses)` | Administración | Crea una ayudantía (1 a 12 meses) |
| `confirmarMes(id)` | Profesor asignado | Paga el siguiente mes al ayudante |
| `retirarSobrante(monto)` | Administración | Retira solo lo no comprometido |

Lecturas gratuitas: `valorUB`, `saldo`, `presupuestoComprometido`, `sobranteDisponible`, `totalAyudantias`, `ayudantias(id)`.

## Limitaciones conocidas y siguientes pasos

- El profesor podría confirmar varios meses el mismo día: el contrato impide pagar de más, pero no controla el calendario. Siguiente paso: exigir 30 días entre confirmaciones.
- La reserva se calcula con el valor UB vigente: si la administración baja el valor, el monto reservado baja.
- La administración es una sola cuenta. En producción sería una wallet multifirma.
- Se paga en AVAX de prueba. En producción se usaría una moneda estable en pesos.

## Arquitectura

```
contracts/   Solidity 0.8.34 + Hardhat 3 (viem), pruebas y despliegue con Ignition
web/         Next.js 16 + wagmi 3 + viem, una sola pantalla
```

- Red: Avalanche Fuji C-Chain, Chain ID `43113`, RPC `https://api.avax-test.network/ext/bc/C/rpc`
- Compilado con `evmVersion: cancun` (soportado por la C-Chain, ACP-131)

## Cómo correrlo localmente

Requisitos: Node.js 22.13 o superior y una wallet (Core o MetaMask) con AVAX de prueba en Fuji.

### Contrato

```bash
cd contracts
npm install
npx hardhat test                     # 10 pruebas automáticas
```

Desplegar tu propia copia en Fuji (la clave se guarda cifrada, nunca en archivos):

```bash
npx hardhat keystore set FUJI_PRIVATE_KEY
npx hardhat ignition deploy ignition/modules/PagoUB.ts --network fuji
npx hardhat run scripts/depositar.ts --network fuji
npx hardhat verify --network fuji --build-profile production <DIRECCION> 1000000000000000
```

### Web

```bash
cd web
npm install
cp .env.example .env.local           # en Windows: copy .env.example .env.local
npm run dev                          # http://localhost:3000
```

Variables (solo valores públicos):

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xF9F0Ddae0b7710A9Ff8C3d8622b1A543C6FC4907` |
| `NEXT_PUBLIC_CHAIN_ID` | `43113` |

La pantalla cambia según la cuenta conectada: la **administración** ve su panel, el **profesor** ve el botón "Confirmar mes" y el **ayudante** ve su avance y su saldo.

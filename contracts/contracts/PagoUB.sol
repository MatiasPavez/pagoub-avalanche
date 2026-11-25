// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PagoUB: pago automático de Unidades Becarias (UB) a ayudantes
/// @notice La administración deposita presupuesto, fija el valor de la UB y
///         registra ayudantías. Cuando el profesor asignado confirma un mes,
///         el contrato paga de inmediato UBs mensuales × valor UB al ayudante.
contract PagoUB {
    struct Ayudantia {
        address ayudante;
        address profesor;
        string curso;
        uint256 ubsMensuales;
        uint256 mesesTotales;
        uint256 mesesPagados;
    }

    /// @notice Cuenta de la administración (quien despliega el contrato).
    address public immutable administracion;

    /// @notice Valor de 1 UB en wei (1 AVAX = 10^18 wei).
    uint256 public valorUB;

    /// @notice Cantidad de ayudantías registradas. Los ids van de 0 a total-1.
    uint256 public totalAyudantias;

    /// @notice UBs aún por pagar, sumando todas las ayudantías.
    uint256 public ubsPendientes;

    mapping(uint256 => Ayudantia) public ayudantias;

    event PresupuestoDepositado(address indexed administracion, uint256 monto);
    event ValorUBActualizado(uint256 valorAnterior, uint256 valorNuevo);
    event AyudantiaRegistrada(
        uint256 indexed id,
        address indexed ayudante,
        address indexed profesor,
        string curso,
        uint256 ubsMensuales,
        uint256 mesesTotales
    );
    event MesConfirmado(
        uint256 indexed id,
        address indexed ayudante,
        uint256 numeroMes,
        uint256 ubs,
        uint256 monto
    );
    event SobranteRetirado(address indexed administracion, uint256 monto);

    modifier soloAdministracion() {
        require(msg.sender == administracion, "Solo la administracion");
        _;
    }

    constructor(uint256 valorUBInicial) {
        require(valorUBInicial > 0, "Valor UB debe ser mayor a 0");
        administracion = msg.sender;
        valorUB = valorUBInicial;
        emit ValorUBActualizado(0, valorUBInicial);
    }

    /// @notice 1) La administración carga presupuesto (en AVAX) al contrato.
    function depositarPresupuesto() external payable soloAdministracion {
        require(msg.value > 0, "Monto debe ser mayor a 0");
        emit PresupuestoDepositado(msg.sender, msg.value);
    }

    /// @notice 2) La administración fija el valor de la UB (en wei).
    ///         Se aplica a los meses que se confirmen desde ahora.
    function fijarValorUB(uint256 nuevoValor) external soloAdministracion {
        require(nuevoValor > 0, "Valor UB debe ser mayor a 0");
        emit ValorUBActualizado(valorUB, nuevoValor);
        valorUB = nuevoValor;
    }

    /// @notice 3) La administración registra una ayudantía. Devuelve su id.
    function registrarAyudantia(
        address ayudante,
        address profesor,
        string calldata curso,
        uint256 ubsMensuales,
        uint256 mesesTotales
    ) external soloAdministracion returns (uint256 id) {
        require(ayudante != address(0), "Ayudante invalido");
        require(profesor != address(0), "Profesor invalido");
        require(ayudante != profesor, "Ayudante y profesor deben ser distintos");
        require(bytes(curso).length > 0, "Curso vacio");
        require(ubsMensuales > 0, "UBs mensuales debe ser mayor a 0");
        require(mesesTotales > 0 && mesesTotales <= 12, "Meses entre 1 y 12");

        id = totalAyudantias;
        totalAyudantias = id + 1;
        ayudantias[id] = Ayudantia(ayudante, profesor, curso, ubsMensuales, mesesTotales, 0);
        ubsPendientes += ubsMensuales * mesesTotales;

        emit AyudantiaRegistrada(id, ayudante, profesor, curso, ubsMensuales, mesesTotales);
    }

    /// @notice 4) El profesor asignado confirma el siguiente mes trabajado y
    ///         el contrato paga UBs mensuales × valor UB al ayudante.
    function confirmarMes(uint256 id) external {
        require(id < totalAyudantias, "Ayudantia no existe");
        Ayudantia storage a = ayudantias[id];
        require(msg.sender == a.profesor, "Solo el profesor de la ayudantia");
        require(a.mesesPagados < a.mesesTotales, "Ayudantia ya pagada completa");

        uint256 monto = a.ubsMensuales * valorUB;
        require(address(this).balance >= monto, "Presupuesto insuficiente");

        // Primero se actualizan los registros, después se envía el dinero
        // (protege contra ataques de reentrada).
        a.mesesPagados += 1;
        ubsPendientes -= a.ubsMensuales;

        (bool ok, ) = payable(a.ayudante).call{value: monto}("");
        require(ok, "Fallo el pago al ayudante");

        emit MesConfirmado(id, a.ayudante, a.mesesPagados, a.ubsMensuales, monto);
    }

    /// @notice 5) La administración retira solo lo que NO está comprometido
    ///         con meses pendientes de pago (al valor UB vigente).
    function retirarSobrante(uint256 monto) external soloAdministracion {
        require(monto > 0, "Monto debe ser mayor a 0");
        require(monto <= sobranteDisponible(), "Monto supera el sobrante");

        (bool ok, ) = payable(administracion).call{value: monto}("");
        require(ok, "Fallo el retiro");

        emit SobranteRetirado(administracion, monto);
    }

    // ---------- Lecturas (gratis, no cuestan gas) ----------

    /// @notice AVAX necesarios para pagar todos los meses pendientes.
    function presupuestoComprometido() public view returns (uint256) {
        return ubsPendientes * valorUB;
    }

    /// @notice AVAX que la administración puede retirar sin afectar pagos.
    function sobranteDisponible() public view returns (uint256) {
        uint256 saldoActual = address(this).balance;
        uint256 comprometido = presupuestoComprometido();
        return saldoActual > comprometido ? saldoActual - comprometido : 0;
    }

    /// @notice Saldo total del contrato.
    function saldo() external view returns (uint256) {
        return address(this).balance;
    }
}

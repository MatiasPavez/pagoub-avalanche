// ABI de PagoUB (copiado desde contracts/artifacts). Es la ficha tecnica del contrato:
// la lista de funciones y eventos que la web puede usar.
export const pagoUBAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "valorUBInicial",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "ayudante",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "profesor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "curso",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ubsMensuales",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "mesesTotales",
        "type": "uint256"
      }
    ],
    "name": "AyudantiaRegistrada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "ayudante",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "numeroMes",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ubs",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "monto",
        "type": "uint256"
      }
    ],
    "name": "MesConfirmado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "administracion",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "monto",
        "type": "uint256"
      }
    ],
    "name": "PresupuestoDepositado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "administracion",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "monto",
        "type": "uint256"
      }
    ],
    "name": "SobranteRetirado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorAnterior",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valorNuevo",
        "type": "uint256"
      }
    ],
    "name": "ValorUBActualizado",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "administracion",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ayudantias",
    "outputs": [
      {
        "internalType": "address",
        "name": "ayudante",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "profesor",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "curso",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "ubsMensuales",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mesesTotales",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mesesPagados",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "confirmarMes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositarPresupuesto",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nuevoValor",
        "type": "uint256"
      }
    ],
    "name": "fijarValorUB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "presupuestoComprometido",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ayudante",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "profesor",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "curso",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "ubsMensuales",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mesesTotales",
        "type": "uint256"
      }
    ],
    "name": "registrarAyudantia",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "monto",
        "type": "uint256"
      }
    ],
    "name": "retirarSobrante",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "saldo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sobranteDisponible",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAyudantias",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ubsPendientes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "valorUB",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

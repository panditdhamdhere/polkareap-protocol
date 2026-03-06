# PolkaReap 🌾

**Cross-chain yield aggregator on Polkadot Hub** — harvest yield across parachains via XCM.

Built for the [Polkadot Solidity Hackathon 2026](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/detail).

## Overview

PolkaReap enables users to deposit assets and earn yield from strategies deployed across the Polkadot ecosystem. It leverages **XCM (Cross-Consensus Messaging)** as a native feature of Polkadot Hub — enabling cross-chain yield strategies that cannot be built on Ethereum.

### Key Features

- **Cross-chain yield** — Access yield opportunities across Polkadot Hub and parachains
- **XCM-native** — Uses the XCM precompile (`0xA0000`) for cross-chain execution
- **Strategy aggregation** — Compare APYs and deposit into the best strategy with one call
- **Modular design** — Register new yield strategies without upgrading the core contract

### Why Polkadot?

- **XCM as native feature** — Not an afterthought; cross-chain is built into the protocol
- **Shared security** — All parachains benefit from Polkadot's NPoS security
- **EVM-compatible** — Deploy Solidity contracts directly on Polkadot Hub

## Project Structure

```
polkareap/
├── contracts/
│   ├── interfaces/
│   │   ├── IXcm.sol          # XCM precompile interface
│   │   └── IYieldStrategy.sol # Yield strategy interface
│   ├── libraries/
│   │   └── ScaleCodec.sol    # SCALE encoding utilities
│   ├── strategies/
│   │   └── CrossChainYieldStrategy.sol  # XCM-enabled strategy
│   ├── mocks/
│   │   └── MockYieldStrategy.sol
│   └── PolkaReap.sol         # Main aggregator contract
├── scripts/xcm/              # XCM message builder (off-chain)
├── frontend/                 # React dApp
├── test/
├── ignition/modules/
├── hardhat.config.ts
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Install

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy to Polkadot Hub Testnet

1. Get testnet tokens from the [Polkadot Faucet](https://faucet.polkadot.io/)
2. Set your private key: `export PRIVATE_KEY=0x...`
3. Deploy: `npm run deploy`
4. Register strategies and set PolkaReap address on CrossChainYieldStrategy (see deployed addresses in output)

### Run Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_POLKAREAP_ADDRESS to your deployed contract
npm install && npm run dev
```

## XCM Integration

PolkaReap integrates with the XCM precompile at address `0x00000000000000000000000000000000000a0000`:

- **`weighMessage`** — Estimate execution cost before sending
- **`execute`** — Run XCM locally on Polkadot Hub
- **`send`** — Send messages to other parachains

Cross-chain strategies will use these to:
1. Query yield rates on remote parachains
2. Execute deposits/withdrawals via XCM
3. Repatriate rewards back to the user

## Roadmap

- [x] Core aggregator contract with strategy registration
- [x] XCM precompile interface integration
- [x] ScaleCodec library for SCALE encoding
- [x] CrossChainYieldStrategy with XCM execute/send
- [x] XCM message builder (scripts/xcm)
- [x] React frontend dApp
- [ ] Token (ERC20) integration for real deposits
- [ ] Integration with parachain DEXes/lending protocols

## License

MIT

## Links

- [Polkadot Hub Docs](https://docs.polkadot.com/)
- [XCM Precompile](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile)
- [OpenGuild Builders Hub](https://build.openguild.wtf/)
- [Polkadot Solidity Hackathon](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/detail)

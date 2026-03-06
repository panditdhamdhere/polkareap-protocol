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
│   ├── mocks/
│   │   └── MockYieldStrategy.sol
│   └── PolkaReap.sol         # Main aggregator contract
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
2. Set your private key (use `npx hardhat vars set PRIVATE_KEY` or export `PRIVATE_KEY` env var):
3. Deploy:
   ```bash
   npm run deploy
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
- [x] Mock strategy for testing
- [ ] Cross-chain strategy implementation (XCM messages)
- [ ] Frontend dApp
- [ ] Integration with parachain DEXes/lending protocols

## License

MIT

## Links

- [Polkadot Hub Docs](https://docs.polkadot.com/)
- [XCM Precompile](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile)
- [OpenGuild Builders Hub](https://build.openguild.wtf/)
- [Polkadot Solidity Hackathon](https://dorahacks.io/hackathon/polkadot-solidity-hackathon/detail)

# XCM Message Builder

Generates SCALE-encoded XCM messages for PolkaReap cross-chain operations.

## Setup

```bash
cd scripts/xcm && npm install
```

## Build Transfer Message

```bash
node buildTransfer.js
```

Outputs a hex string that can be passed to:
1. `CrossChainYieldStrategy.weighMessage(message)` - get execution weight
2. `CrossChainYieldStrategy.executeXcm(message, weight)` - execute

## XCM Format

Polkadot Hub uses XCM for cross-chain messaging. Common instructions:

- **WithdrawAsset** - Remove assets from sender
- **BuyExecution** - Pay for execution with withdrawn assets
- **DepositAsset** - Send remaining assets to beneficiary

Messages must be SCALE-encoded. The builder uses @polkadot/api's createType for encoding.

## Customization

Edit `buildTransfer.js` to:
- Change amount, fee, or beneficiary
- Target different parachains (MultiLocation)
- Use XCM v3/v5 format (check Polkadot Hub docs)

## References

- [XCM Precompile Docs](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile)
- [XCM Format](https://github.com/polkadot-fellows/xcm-format)

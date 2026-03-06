/**
 * XCM Message Builder for PolkaReap
 * Generates SCALE-encoded XCM for cross-chain transfer on Polkadot Hub
 *
 * Usage: node buildTransfer.js
 * Requires: @polkadot/api
 *
 * Connect to Polkadot Hub testnet and encode a sample XCM transfer message.
 * The output hex can be passed to CrossChainYieldStrategy.executeXcm() or
 * PolkaReap.executeXcm() for execution.
 */

import { ApiPromise, WsProvider } from "@polkadot/api";

const POLKADOT_HUB_TESTNET_WS = "wss://testnet-passet-hub.polkadot.io";
const POLKADOT_HUB_TESTNET_HTTP = "https://services.polkadothub-rpc.com/testnet";

// Example: Transfer 1 DOT (10^10 units) - adjust for testnet (PAS)
const AMOUNT = 1_000_000_000n; // 0.1 PAS (testnet)
const FEE_AMOUNT = 100_000_000n; // 0.01 PAS for fees

async function buildTransferXcm() {
  let api;
  try {
    // Use HTTP for compatibility (some providers only have HTTP)
    const provider = new WsProvider(POLKADOT_HUB_TESTNET_WS);
    api = await ApiPromise.create({ provider });

    // XCM V2 format (common for Polkadot Hub)
    // Structure: WithdrawAsset -> BuyExecution -> DepositAsset
    const xcmMessage = api.createType("XcmVersionedXcm", {
      v2: [
        {
          WithdrawAsset: [
            {
              id: {
                Concrete: {
                  parents: 1,
                  interior: "Here",
                },
              },
              fun: {
                Fungible: AMOUNT,
              },
            },
          ],
        },
        {
          BuyExecution: {
            fees: {
              id: {
                Concrete: {
                  parents: 1,
                  interior: "Here",
                },
              },
              fun: {
                Fungible: FEE_AMOUNT,
              },
            },
            weightLimit: "Unlimited",
          },
        },
        {
          DepositAsset: {
            assets: { Wild: "AllCounted" },
            maxAssets: 1,
            beneficiary: {
              parents: 0,
              interior: {
                X1: {
                  AccountId32: {
                    network: "Any",
                    id: "0x0000000000000000000000000000000000000000000000000000000000000000",
                  },
                },
              },
            },
          },
        },
      ],
    });

    const encoded = xcmMessage.toHex();
    console.log("XCM Message (hex):");
    console.log(encoded);
    console.log("\nPass this to CrossChainYieldStrategy.weighMessage() first,");
    console.log("then executeXcm(message, weight) with the returned weight.");
    return encoded;
  } catch (err) {
    console.error("Error building XCM:", err.message);
    // Fallback: return example from Polkadot docs (testnet format)
    const fallback =
      "0x050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e";
    console.log("\nUsing fallback example from docs:");
    console.log(fallback);
    return fallback;
  } finally {
    if (api) await api.disconnect();
  }
}

buildTransferXcm();

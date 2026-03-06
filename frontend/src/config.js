// PolkaReap frontend config
// Set VITE_POLKAREAP_ADDRESS after deployment
export const POLKADOT_HUB_TESTNET = {
  chainId: "0x19020191", // 420420417 in hex
  chainIdDecimal: 420420417,
  name: "Polkadot Hub Testnet",
  rpcUrl: "https://services.polkadothub-rpc.com/testnet",
  blockExplorer: "https://blockscout-testnet.polkadot.io",
};

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_POLKAREAP_ADDRESS || "0x0000000000000000000000000000000000000000";

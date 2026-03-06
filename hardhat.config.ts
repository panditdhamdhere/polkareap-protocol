import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    polkadotTestnet: {
      url: "https://services.polkadothub-rpc.com/testnet",
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      polkadotTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "polkadotTestnet",
        chainId: 420420417,
        urls: {
          apiURL: "https://blockscout-testnet.polkadot.io/api",
          browserURL: "https://blockscout-testnet.polkadot.io/",
        },
      },
    ],
  },
};

export default config;

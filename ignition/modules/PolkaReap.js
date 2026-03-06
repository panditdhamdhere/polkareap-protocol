const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PolkaReapModule", (m) => {
  const polkaReap = m.contract("PolkaReap");

  // Deploy strategies
  const mockStrategy1 = m.contract("MockYieldStrategy", [
    "DOT Staking",
    2000,
    1000000000000000000n, // 1 token min
    800,
  ]);
  const mockStrategy2 = m.contract("MockYieldStrategy", [
    "Lending Pool",
    2000,
    500000000000000000n,
    1200,
  ]);
  const xcmStrategy = m.contract("CrossChainYieldStrategy", [
    "Cross-Chain XCM",
    2000,
    100000000000000000n,
    600,
  ]);

  return { polkaReap, mockStrategy1, mockStrategy2, xcmStrategy };
});

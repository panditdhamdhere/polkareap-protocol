const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PolkaReapModule", (m) => {
  const polkaReap = m.contract("PolkaReap");

  return { polkaReap };
});

// Minimal ABI for PolkaReap - only the functions we need
export const PolkaReapABI = [
  "function strategyCount() view returns (uint256)",
  "function strategies(uint256) view returns (address)",
  "function getUserBalance(uint256 strategyId, address user) view returns (uint256)",
  "function getBestStrategy() view returns (uint256 bestStrategyId, uint256 bestAPY)",
  "function getStrategiesInfo() view returns (tuple(string name, uint256 chainId, address yieldToken, uint256 minDeposit, bool isActive)[])",
  "function deposit(uint256 strategyId, uint256 amount)",
  "function withdraw(uint256 strategyId, uint256 amount)",
  "function getXcmPrecompile() view returns (address)",
];

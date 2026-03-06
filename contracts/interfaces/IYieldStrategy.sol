// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IYieldStrategy
/// @notice Interface for yield strategies that can be executed across parachains via XCM
interface IYieldStrategy {
    /// @notice Strategy metadata
    struct StrategyInfo {
        string name;
        uint256 chainId;      // Target parachain ID
        address yieldToken;   // Token that accrues yield
        uint256 minDeposit;   // Minimum deposit amount
        bool isActive;
    }

    /// @notice Get strategy information
    function getStrategyInfo() external view returns (StrategyInfo memory);

    /// @notice Estimated APY for this strategy (basis points, e.g. 500 = 5%)
    function getEstimatedAPY() external view returns (uint256);

    /// @notice Deposit into yield strategy (may trigger XCM)
    /// @param amount Amount to deposit
    /// @param beneficiary Address to receive yield/withdrawals
    function deposit(uint256 amount, address beneficiary) external returns (bool);

    /// @notice Withdraw from strategy (may trigger XCM)
    /// @param amount Amount to withdraw
    /// @param recipient Address to receive withdrawn funds
    function withdraw(uint256 amount, address recipient) external returns (bool);

    /// @notice Current balance for a user in this strategy
    function balanceOf(address account) external view returns (uint256);

    /// @notice Emitted when funds are deposited
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);

    /// @notice Emitted when funds are withdrawn
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
}

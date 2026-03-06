// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IXcm.sol";
import "./interfaces/IYieldStrategy.sol";

/// @title PolkaReap
/// @notice Cross-chain yield aggregator on Polkadot Hub - harvest yield across parachains via XCM
/// @dev Built for the Polkadot Solidity Hackathon 2026 - leverages XCM as native feature
contract PolkaReap {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    address public immutable xcmPrecompile;
    address public owner;

    /// @dev Registered yield strategies (strategyId => strategy contract)
    mapping(uint256 => address) public strategies;

    /// @dev Strategy counter
    uint256 public strategyCount;

    /// @dev User deposits per strategy (strategyId => user => amount)
    mapping(uint256 => mapping(address => uint256)) public userDeposits;

    /// @dev Total deposits per strategy
    mapping(uint256 => uint256) public totalDeposits;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event StrategyRegistered(uint256 indexed strategyId, address indexed strategy, string name);
    event StrategyDeposit(address indexed user, uint256 indexed strategyId, uint256 amount);
    event StrategyWithdraw(address indexed user, uint256 indexed strategyId, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event XcmMessageSent(bytes destination, bytes message);
    event XcmMessageExecuted(bytes message, bool success);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error Unauthorized();
    error InvalidStrategy();
    error StrategyInactive();
    error InsufficientDeposit();
    error InsufficientBalance();
    error TransferFailed();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        xcmPrecompile = XCM_PRECOMPILE_ADDRESS;
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /// @notice Register a new yield strategy
    function registerStrategy(address strategyAddress) external onlyOwner returns (uint256) {
        if (strategyAddress == address(0)) revert InvalidStrategy();

        IYieldStrategy strategy = IYieldStrategy(strategyAddress);
        IYieldStrategy.StrategyInfo memory info = strategy.getStrategyInfo();
        if (!info.isActive) revert StrategyInactive();

        strategyCount++;
        strategies[strategyCount] = strategyAddress;

        emit StrategyRegistered(strategyCount, strategyAddress, info.name);
        return strategyCount;
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidStrategy();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // -------------------------------------------------------------------------
    // Core: Deposit & Withdraw
    // -------------------------------------------------------------------------

    /// @notice Deposit into a yield strategy
    /// @param strategyId Registered strategy ID
    /// @param amount Amount to deposit
    function deposit(uint256 strategyId, uint256 amount) external {
        address strategyAddr = strategies[strategyId];
        if (strategyAddr == address(0)) revert InvalidStrategy();

        IYieldStrategy strategy = IYieldStrategy(strategyAddr);
        IYieldStrategy.StrategyInfo memory info = strategy.getStrategyInfo();
        if (!info.isActive) revert StrategyInactive();
        if (amount < info.minDeposit) revert InsufficientDeposit();

        userDeposits[strategyId][msg.sender] += amount;
        totalDeposits[strategyId] += amount;

        bool success = strategy.deposit(amount, msg.sender);
        if (!success) revert TransferFailed();

        emit StrategyDeposit(msg.sender, strategyId, amount);
    }

    /// @notice Withdraw from a yield strategy
    /// @param strategyId Registered strategy ID
    /// @param amount Amount to withdraw
    function withdraw(uint256 strategyId, uint256 amount) external {
        if (userDeposits[strategyId][msg.sender] < amount) revert InsufficientBalance();

        address strategyAddr = strategies[strategyId];
        if (strategyAddr == address(0)) revert InvalidStrategy();

        userDeposits[strategyId][msg.sender] -= amount;
        totalDeposits[strategyId] -= amount;

        bool success = IYieldStrategy(strategyAddr).withdraw(amount, msg.sender);
        if (!success) revert TransferFailed();

        emit StrategyWithdraw(msg.sender, strategyId, amount);
    }

    // -------------------------------------------------------------------------
    // XCM Integration (for cross-chain strategies)
    // -------------------------------------------------------------------------

    /// @notice Get XCM precompile address (for frontend/strategy contracts)
    function getXcmPrecompile() external view returns (address) {
        return xcmPrecompile;
    }

    /// @notice Estimate weight for an XCM message (callable by strategies)
    /// @param message SCALE-encoded XCM message
    function weighXcmMessage(bytes calldata message) external view returns (IXcm.Weight memory) {
        return IXcm(xcmPrecompile).weighMessage(message);
    }

    /// @notice Execute XCM message locally (for strategies that need cross-chain execution)
    /// @dev Strategies can call this via the aggregator for XCM execution
    /// @param message SCALE-encoded XCM message
    /// @param weight Pre-calculated weight from weighMessage
    function executeXcm(bytes calldata message, IXcm.Weight calldata weight) external onlyOwner {
        IXcm(xcmPrecompile).execute(message, weight);
        emit XcmMessageExecuted(message, true);
    }

    /// @notice Send XCM message to another parachain
    /// @param destination SCALE-encoded MultiLocation
    /// @param message SCALE-encoded XCM message
    function sendXcm(bytes calldata destination, bytes calldata message) external onlyOwner {
        IXcm(xcmPrecompile).send(destination, message);
        emit XcmMessageSent(destination, message);
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------

    /// @notice Get user's balance in a strategy
    function getUserBalance(uint256 strategyId, address user) external view returns (uint256) {
        return userDeposits[strategyId][user];
    }

    /// @notice Get best APY among registered strategies for a given asset
    /// @dev Simplified - returns highest APY strategy ID (can be extended with asset param)
    function getBestStrategy() external view returns (uint256 bestStrategyId, uint256 bestAPY) {
        for (uint256 i = 1; i <= strategyCount; i++) {
            address addr = strategies[i];
            if (addr == address(0)) continue;

            uint256 apy = IYieldStrategy(addr).getEstimatedAPY();
            if (apy > bestAPY) {
                bestAPY = apy;
                bestStrategyId = i;
            }
        }
    }

    /// @notice Get all active strategies with their info
    function getStrategiesInfo() external view returns (IYieldStrategy.StrategyInfo[] memory) {
        IYieldStrategy.StrategyInfo[] memory infos = new IYieldStrategy.StrategyInfo[](strategyCount);
        for (uint256 i = 1; i <= strategyCount; i++) {
            address addr = strategies[i];
            if (addr != address(0)) {
                infos[i - 1] = IYieldStrategy(addr).getStrategyInfo();
            }
        }
        return infos;
    }
}

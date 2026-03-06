// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IXcm.sol";
import "../interfaces/IYieldStrategy.sol";
import "../libraries/ScaleCodec.sol";

/// @title CrossChainYieldStrategy
/// @notice Yield strategy that executes XCM to move assets across parachains
/// @dev Demonstrates Polkadot's native cross-chain capability - the hackathon differentiator
/// @dev XCM messages are built off-chain and passed in; execution happens on-chain via precompile
contract CrossChainYieldStrategy is IYieldStrategy {
    address public immutable xcmPrecompile;
    address public polkaReap;
    address public owner;

    StrategyInfo private _info;

    /// @dev User balances (beneficiary => amount)
    mapping(address => uint256) private _balances;

    /// @dev Total vault balance
    uint256 public totalVaultBalance;

    uint256 private _apyBps;

    event XcmExecuted(bytes message, bool success);
    event PolkaReapSet(address indexed aggregator);
    error Unauthorized();
    error InvalidAddress();
    error XcmExecutionFailed();

    constructor(
        string memory name,
        uint256 chainId,
        uint256 minDeposit,
        uint256 apyBps
    ) {
        owner = msg.sender;
        xcmPrecompile = XCM_PRECOMPILE_ADDRESS;
        _info = StrategyInfo({
            name: name,
            chainId: chainId,
            yieldToken: address(0),
            minDeposit: minDeposit,
            isActive: true
        });
        _apyBps = apyBps;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyPolkaReapOrOwner() {
        if (msg.sender != polkaReap && msg.sender != owner) revert Unauthorized();
        _;
    }

    /// @notice Set the PolkaReap aggregator address (for deposit/withdraw integration)
    function setPolkaReap(address _polkaReap) external onlyOwner {
        if (_polkaReap == address(0)) revert InvalidAddress();
        polkaReap = _polkaReap;
        emit PolkaReapSet(_polkaReap);
    }

    // -------------------------------------------------------------------------
    // IYieldStrategy implementation
    // -------------------------------------------------------------------------

    function getStrategyInfo() external view override returns (StrategyInfo memory) {
        return _info;
    }

    function getEstimatedAPY() external view override returns (uint256) {
        return _apyBps;
    }

    /// @notice Deposit - records user position (token transfer handled by PolkaReap/outside)
    /// @dev For XCM strategy, the actual cross-chain move happens via executeXcm
    function deposit(uint256 amount, address beneficiary) external override onlyPolkaReapOrOwner returns (bool) {
        _balances[beneficiary] += amount;
        totalVaultBalance += amount;
        emit Deposited(beneficiary, amount, block.timestamp);
        return true;
    }

    /// @notice Withdraw - releases user position
    function withdraw(uint256 amount, address recipient) external override onlyPolkaReapOrOwner returns (bool) {
        if (_balances[recipient] < amount) return false;
        _balances[recipient] -= amount;
        totalVaultBalance -= amount;
        emit Withdrawn(recipient, amount, block.timestamp);
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    // -------------------------------------------------------------------------
    // XCM Execution (core differentiator)
    // -------------------------------------------------------------------------

    /// @notice Estimate weight for an XCM message before execution
    /// @param message SCALE-encoded XCM message (built off-chain)
    function weighMessage(bytes calldata message) external view returns (IXcm.Weight memory) {
        return IXcm(xcmPrecompile).weighMessage(message);
    }

    /// @notice Execute XCM message locally - moves assets per the encoded instructions
    /// @param message SCALE-encoded XCM message (e.g. WithdrawAsset, BuyExecution, DepositAsset)
    /// @param weight Pre-calculated from weighMessage to avoid reversion
    /// @dev Message must be built off-chain using scripts/xcm or polkadot-api
    function executeXcm(bytes calldata message, IXcm.Weight calldata weight) external onlyOwner {
        IXcm(xcmPrecompile).execute(message, weight);
        emit XcmExecuted(message, true);
    }

    /// @notice Send XCM message to another parachain
    /// @param destination SCALE-encoded MultiLocation (e.g. Parachain(2000))
    /// @param message SCALE-encoded XCM message
    function sendXcm(bytes calldata destination, bytes calldata message) external onlyOwner {
        IXcm(xcmPrecompile).send(destination, message);
        emit XcmExecuted(message, true);
    }
}

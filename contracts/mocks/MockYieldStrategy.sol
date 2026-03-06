// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IYieldStrategy.sol";

/// @title MockYieldStrategy
/// @notice Simple mock for testing PolkaReap - simulates a yield strategy
contract MockYieldStrategy is IYieldStrategy {
    StrategyInfo private _info;
    mapping(address => uint256) private _balances;

    constructor(
        string memory name,
        uint256 chainId,
        uint256 minDeposit,
        uint256 apyBps
    ) {
        _info = StrategyInfo({
            name: name,
            chainId: chainId,
            yieldToken: address(0), // Mock - no token
            minDeposit: minDeposit,
            isActive: true
        });
        _apyBps = apyBps;
    }

    uint256 private _apyBps;

    function getStrategyInfo() external view override returns (StrategyInfo memory) {
        return _info;
    }

    function getEstimatedAPY() external view override returns (uint256) {
        return _apyBps;
    }

    function deposit(uint256 amount, address beneficiary) external override returns (bool) {
        _balances[beneficiary] += amount;
        emit Deposited(beneficiary, amount, block.timestamp);
        return true;
    }

    function withdraw(uint256 amount, address recipient) external override returns (bool) {
        require(_balances[recipient] >= amount, "Insufficient balance");
        _balances[recipient] -= amount;
        emit Withdrawn(recipient, amount, block.timestamp);
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    /// @dev For mock: simulate that msg.sender is the depositor (PolkaReap calls on behalf of user)
    /// In production, strategies would need different semantics
    function setBalance(address account, uint256 amount) external {
        _balances[account] = amount;
    }
}

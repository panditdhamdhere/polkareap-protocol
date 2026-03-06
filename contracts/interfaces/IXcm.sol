// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev The on-chain address of the XCM (Cross-Consensus Messaging) precompile on Polkadot Hub.
address constant XCM_PRECOMPILE_ADDRESS = address(0xA0000);

/// @title IXcm - XCM Precompile Interface
/// @notice Low-level interface for interacting with pallet_xcm on Polkadot Hub.
/// @dev Enables cross-chain messaging from Solidity - the core differentiator of Polkadot.
/// @dev Documentation: https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile
interface IXcm {
    /// @notice Weight v2 used for XCM execution measurement
    struct Weight {
        uint64 refTime;   // Computational time on reference hardware
        uint64 proofSize; // Size of proof needed for execution
    }

    /// @notice Executes an XCM message locally on the current chain with the caller's origin
    /// @param message SCALE-encoded Versioned XCM message
    /// @param weight Maximum allowed Weight for execution (use weighMessage to estimate)
    function execute(bytes calldata message, Weight calldata weight) external;

    /// @notice Sends an XCM message to another parachain or consensus system
    /// @param destination SCALE-encoded destination MultiLocation
    /// @param message SCALE-encoded Versioned XCM message
    function send(bytes calldata destination, bytes calldata message) external;

    /// @notice Estimates the Weight required to execute a given XCM message
    /// @param message SCALE-encoded Versioned XCM message to analyze
    /// @return weight Struct containing estimated refTime and proofSize
    function weighMessage(bytes calldata message) external view returns (Weight memory weight);
}

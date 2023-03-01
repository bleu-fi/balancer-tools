// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "balancer-v2-monorepo/pkg/interfaces/contracts/vault/IVault.sol";
import "balancer-v2-monorepo/pkg/interfaces/contracts/vault/IBasePool.sol";
import "balancer-v2-monorepo/pkg/pool-utils/contracts/BasePoolAuthorization.sol";

interface IPoolMetadataRegistry {
    event PoolMetadataUpdated(bytes32 indexed poolId, string metadataCID);
}

/// TODO: https://linear.app/bleu-llc/issue/BAL-84/define-poolmetadataregistrysol-metadata
/// @title A Pool Metadata dApp
/// @author Bleu LLC
/// @notice This contract provides a registry for Balancer's Pools metadata
contract PoolMetadataRegistry is IPoolMetadataRegistry {
    IVault private immutable _vault;

    mapping(bytes32 => string) public poolIdMetadataCIDMap;

    constructor(IVault vault) {
        _vault = vault;
    }

    /// @notice Checks if a Pool is registered on Balancer
    /// @param poolId The pool ID to check against the Balancer vault
    /// @return bool Returns TRUE for registered and FALSE for unregistered
    function _isPoolRegistered(bytes32 poolId) internal view returns (bool) {
        try _vault.getPool(poolId) returns (address, IVault.PoolSpecialization) {
            return true;
        } catch (bytes memory) {
            return false;
        }
    }

    /// @notice Check if the caller is the pool owner
    /// @param poolId The pool ID where the ownership will be tested.
    /// @return bool Returns TRUE if the caller is the Pool owner, FALSE otherwise.
    function _isPoolOwner(bytes32 poolId) public view returns (bool) {
        (address pool,) = _vault.getPool(poolId);

        return BasePoolAuthorization(pool).getOwner() == msg.sender ? true : false;
    }

    /// @notice Updates the pool metadata CID
    /// @param poolId The pool ID to update the metadata
    /// @param metadataCID The metadataCID related to the new pool metadata
    function setPoolMetadata(bytes32 poolId, string memory metadataCID) public {
        require(_isPoolRegistered(poolId), "Pool not registered");
        require(_isPoolOwner(poolId), "Caller is not the owner");
        poolIdMetadataCIDMap[poolId] = metadataCID;
        emit PoolMetadataUpdated(poolId, metadataCID);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PollFactory.sol";

abstract contract CodeConstant {
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    uint256 public constant ETH_SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant ZK_SEPOLIA_CHAIN_ID = 300;
}

contract HelperConfig is Script, CodeConstant {
    error HelperConfig__InvalidChainId();

    struct NetworkConfig {
        address contractOwner;
    }

    mapping(uint256 => NetworkConfig) public networkConfig;

    constructor() {
        networkConfig[ETH_SEPOLIA_CHAIN_ID] = getSepoliaConfig();
        networkConfig[LOCAL_CHAIN_ID] = getLocalConfig();
        networkConfig[ZK_SEPOLIA_CHAIN_ID] = getZKsyncConfig();
    }

    function getConfig() public view returns (NetworkConfig memory) {
        return getConfigByChainId(block.chainid);
    }

    function getConfigByChainId(uint256 chainId) public view returns (NetworkConfig memory) {
        if (networkConfig[chainId].contractOwner != address(0)) {
            return networkConfig[chainId];
        } else if (chainId == LOCAL_CHAIN_ID) {
            return getLocalConfig();
        } else {
            revert HelperConfig__InvalidChainId();
        }
    }

    function getOwner() external view returns (address) {
        return getConfig().contractOwner;
    }

    function getSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({contractOwner: 0xF8C85DddaAfE76E46593Cc565011716A31192B97});
    }

    function getZKsyncConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({contractOwner: 0xF8C85DddaAfE76E46593Cc565011716A31192B97});
    }

    function getLocalConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({contractOwner: msg.sender});
    }

    // function getLocalConfig() public view returns (NetworkConfig memory) {
    //     return NetworkConfig({
    //         contractOwner: msg.sender
    //     });
    // }
}

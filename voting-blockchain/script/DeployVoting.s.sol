//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PollFactory.sol";
import "./HelperConfig.s.sol";

contract DeployVoting is Script {
    function run() public {
        HelperConfig helper = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helper.getConfig();

        // Use config.contractOwner unless you're deploying locally
        address owner = block.chainid == 31337 ? msg.sender : config.contractOwner;

        vm.startBroadcast();
        PollFactory pollFactory = new PollFactory();
        vm.stopBroadcast();
    }
}

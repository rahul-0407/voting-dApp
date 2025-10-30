// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/PollFactory.sol";  // ✅ Changed from Voting.sol

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying Verifier...");
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Verifier:", address(verifier));
        
        console.log("Deploying PollFactory...");
        PollFactory pollFactory = new PollFactory(address(verifier));
        console.log("PollFactory:", address(pollFactory));
        
        vm.stopBroadcast();
        
        // Save addresses
        string memory addresses = string(abi.encodePacked(
            '{\n',
            '  "verifier": "', vm.toString(address(verifier)), '",\n',
            '  "pollFactory": "', vm.toString(address(pollFactory)), '"\n',
            '}'
        ));
        
        vm.writeFile("./deployed-addresses.json", addresses);
        console.log("\nAddresses saved to deployed-addresses.json");
    }
}
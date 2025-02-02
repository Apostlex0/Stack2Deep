// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {AIAgentVault} from "../src/AIAgentVault.sol";

contract DeployAIAgentVault is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        
        AIAgentVault vault = new AIAgentVault(aiAgentAddress);
        
        vm.stopBroadcast();
        
        console.log("AIAgentVault deployed at:", address(vault));
    }
}

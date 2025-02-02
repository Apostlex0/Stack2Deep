// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {AIAgentVault} from "../src/AIAgentVault.sol";

contract AIAgentVaultTest is Test {
    AIAgentVault public vault;
    address public aiAgent;
    
    function setUp() public {
        aiAgent = address(this);
        vault = new AIAgentVault(aiAgent);
    }

    function testSetup() public {
        assertEq(vault.aiAgent(), aiAgent, "AI agent should be properly set");
    }
}

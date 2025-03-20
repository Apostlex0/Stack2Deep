// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 *  AIAgentVault.sol
 *
 *  A simple vault contract where users can deposit or withdraw
 *  AAVE/DAI. The AI agent is the only address that can call `executeSwap`,
 *  which internally uses Uniswap V2 to swap user funds from one token to
 *  the other, stored in the vault.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract AIAgentVault {
    using SafeERC20 for IERC20;

   
    address public constant YBTC = 0xBBd3EDd4D3b519c0d14965d9311185CFaC8c3220;
    address public constant YU  = 0xcB856bC5Aa2664E47c9caDce6fF65117c5201a1C;
    
    address public constant UNISWAP_V2_ROUTER = 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3;

    
    address public aiAgent;

    // user => amount of AAVE in vault
    mapping(address => uint256) public userAAVEBalance;
    // user => amount of DAI in vault
    mapping(address => uint256) public userDAIBalance;

    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _aiAgent) {
        require(_aiAgent != address(0), "Invalid AI Agent address");
        aiAgent = _aiAgent;
    }

    // --- Deposit Functions ---

    function depositYBTC(uint256 _amount) external {
        require(_amount > 0, "Deposit must be > 0");
        IERC20(YBTC).safeTransferFrom(msg.sender, address(this), _amount);
        userAAVEBalance[msg.sender] += _amount;
        emit Deposit(msg.sender, YBTC, _amount);
    }

    function depositYU(uint256 _amount) external {
        require(_amount > 0, "Deposit must be > 0");
        IERC20(YU).safeTransferFrom(msg.sender, address(this), _amount);
        userDAIBalance[msg.sender] += _amount;
        emit Deposit(msg.sender, YU, _amount);
    }

    // --- Withdraw Functions ---

    function withdrawYBTC(uint256 _amount) external {
        require(userAAVEBalance[msg.sender] >= _amount, "Insufficient YBTC balance");
        userAAVEBalance[msg.sender] -= _amount;
        IERC20(YBTC).safeTransfer(msg.sender, _amount);
        emit Withdraw(msg.sender, YBTC, _amount);
    }

    function withdrawYU(uint256 _amount) external {
        require(userDAIBalance[msg.sender] >= _amount, "Insufficient YU balance");
        userDAIBalance[msg.sender] -= _amount;
        IERC20(YU).safeTransfer(msg.sender, _amount);
        emit Withdraw(msg.sender, YU, _amount);
    }

    // --- Swap Execution (only AI agent) ---
    /**
     * @dev The AI agent calls this on behalf of a user
     *      to swap user's tokenIn -> tokenOut using Uniswap V2.
     *      The swapped tokens remain in this vault but credited to the user.
     */
    function executeSwap(
        address _user,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut,
        uint256 _deadline
    ) external {
        require(msg.sender == aiAgent, "Not authorized");
        require(_user != address(0), "Invalid user");

        require(
            (_tokenIn == YBTC && _tokenOut == YU) ||
            (_tokenIn == YU && _tokenOut == YBTC),
            "Unsupported tokens"
        );

        // Check user has enough balance in vault
        if (_tokenIn == YBTC) {
            require(userAAVEBalance[_user] >= _amountIn, "Insufficient YBTC balance");
            userAAVEBalance[_user] -= _amountIn;
        } else {
            require(userDAIBalance[_user] >= _amountIn, "Insufficient YU balance");
            userDAIBalance[_user] -= _amountIn;
        }

        // Approve router to spend
        IERC20(_tokenIn).safeIncreaseAllowance(UNISWAP_V2_ROUTER, _amountIn);

        // Path: [tokenIn, tokenOut]
        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        // Perform the swap
        uint256[] memory amounts = IUniswapV2Router(UNISWAP_V2_ROUTER)
            .swapExactTokensForTokens(
                _amountIn,
                _minAmountOut,   // slippage is up to AI to decide
                path,
                address(this),   // receive swapped tokens in this vault
                _deadline
            );

        // amounts[0] is input, amounts[1] is output
        uint256 amountOut = amounts[amounts.length - 1];

        // Credit user in the new token
        if (_tokenOut == YBTC) {
            userAAVEBalance[_user] += amountOut;
        } else {
            userDAIBalance[_user] += amountOut;
        }

        emit SwapExecuted(_user, _tokenIn, _tokenOut, _amountIn, amountOut);
    }

    // (Optional) function to change the AI agent address if needed
    function setAIAgent(address _newAgent) external {
        require(_newAgent != address(0), "Invalid agent");
        aiAgent = _newAgent;
    }
}

import { mockWalletClient, resetAllMocks } from '../mocks/mockSetup.js';
import { Hash } from 'viem';

jest.mock('../../src/agent/viem/createViemWalletClient', () => ({
  createViemWalletClient: jest.fn(() => mockWalletClient)
}));

describe('executeVaultSwap Tool', () => {
  const mockVaultAddress = '0xdfA8A83B0941F1d3ec47AD3BfEAE9D929E29b915';
  const mockUserAddress = '0x1234567890123456789012345678901234567890';
  const mockTokenInAddress = '0xBBd3EDd4D3b519c0d14965d9311185CFaC8c3220';
  const mockTokenOutAddress = '0xcB856bC5Aa2664E47c9caDce6fF65117c5201a1C';
  const mockHash = '0xabcdef1234567890' as Hash;

  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  it('should execute swap with correct parameters', async () => {
    mockWalletClient.writeContract.mockResolvedValue(mockHash);
    
    const { executeVaultSwapTool } = require('../../src/agent/tools/executeVaultSwap');
    
    const result = await executeVaultSwapTool.handler({
      vaultAddress: mockVaultAddress,
      user: mockUserAddress,
      tokenIn: mockTokenInAddress,
      tokenOut: mockTokenOutAddress,
      amountIn: '5000000000000000000',
      minAmountOut: '1000000000000000000',
      deadline: (Math.floor(Date.now() / 1000) + 600).toString()
    });
    
    expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
      address: mockVaultAddress,
      abi: expect.any(Array),
      functionName: 'executeSwap',
      args: [
        mockUserAddress,
        mockTokenInAddress,
        mockTokenOutAddress,
        BigInt('5000000000000000000'),
        BigInt('1000000000000000000'),
        expect.any(BigInt)
      ]
    });
    
    expect(result).toContain('Swap executed successfully');
    expect(result).toContain(mockHash);
  });

  it('should scale up small token amounts', async () => {
    mockWalletClient.writeContract.mockResolvedValue(mockHash);
    
    const { executeVaultSwapTool } = require('../../src/agent/tools/executeVaultSwap');
    
    await executeVaultSwapTool.handler({
      vaultAddress: mockVaultAddress,
      user: mockUserAddress,
      tokenIn: mockTokenInAddress,
      tokenOut: mockTokenOutAddress,
      amountIn: '5',
      minAmountOut: '1',
      deadline: (Math.floor(Date.now() / 1000) + 600).toString()
    });
    
    expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [
          mockUserAddress,
          mockTokenInAddress,
          mockTokenOutAddress,
          BigInt('5000000000000000000'),
          BigInt('1000000000000000000'),
          expect.any(BigInt)
        ]
      })
    );
  });

  it('should handle errors during swap', async () => {
    mockWalletClient.writeContract.mockRejectedValue(new Error('Insufficient balance'));
    
    const { executeVaultSwapTool } = require('../../src/agent/tools/executeVaultSwap');
    
    const result = await executeVaultSwapTool.handler({
      vaultAddress: mockVaultAddress,
      user: mockUserAddress,
      tokenIn: mockTokenInAddress,
      tokenOut: mockTokenOutAddress,
      amountIn: '5000000000000000000',
      minAmountOut: '1000000000000000000',
      deadline: (Math.floor(Date.now() / 1000) + 600).toString()
    });
    
    expect(result).toContain('Swap failed with error');
    expect(result).toContain('Insufficient balance');
  });
});

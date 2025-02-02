import { mockPublicClient, resetAllMocks } from '../mocks/mockSetup.js';
import { Address } from 'viem';

jest.mock('../../src/agent/viem/createViemPublicClient', () => ({
  createViemPublicClient: jest.fn(() => mockPublicClient)
}));

describe('getTokenBalance Tool', () => {
  const mockTokenAddress = '0xBBd3EDd4D3b519c0d14965d9311185CFaC8c3220' as Address; // YBTC
  const mockUserAddress = '0x1234567890123456789012345678901234567890' as Address;
  const mockBalance = 5000000000000000000n; // 5 tokens in wei
  
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });
  
  it('should fetch token balance with correct parameters', async () => {
    mockPublicClient.readContract.mockResolvedValue(mockBalance);
    
    const { getTokenBalanceTool } = require('../../src/agent/tools/getTokenBalance');
    
    const result = await getTokenBalanceTool.handler({
      tokenAddress: mockTokenAddress,
      accountAddress: mockUserAddress
    });
    
    expect(mockPublicClient.readContract).toHaveBeenCalledWith({
      address: mockTokenAddress,
      abi: expect.arrayContaining([
        expect.objectContaining({
          name: 'balanceOf'
        })
      ]),
      functionName: 'balanceOf',
      args: [mockUserAddress]
    });
    
    expect(result).toContain('5.0');
    expect(result).toContain(mockUserAddress);
    expect(result).toContain(mockTokenAddress);
  });
  
  it('should handle zero balances correctly', async () => {
    mockPublicClient.readContract.mockResolvedValue(0n);
    
    const { getTokenBalanceTool } = require('../../src/agent/tools/getTokenBalance');
    
    const result = await getTokenBalanceTool.handler({
      tokenAddress: mockTokenAddress,
      accountAddress: mockUserAddress
    });
    
    expect(result).toContain('0.0');
  });
  
  it('should handle errors when fetching balance', async () => {
    mockPublicClient.readContract.mockRejectedValue(new Error('Token contract not found'));
    
    const { getTokenBalanceTool } = require('../../src/agent/tools/getTokenBalance');
    
    const result = await getTokenBalanceTool.handler({
      tokenAddress: mockTokenAddress,
      accountAddress: mockUserAddress
    });
    
    expect(result).toContain('Failed to fetch token balance');
    expect(result).toContain('Token contract not found');
  });
});

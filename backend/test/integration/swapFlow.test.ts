import { resetAllMocks } from '../mocks/mockSetup.js';
import OpenAI from 'openai';
import { createAssistant } from '../../src/agent/openai/createAssistant.js';
import { createThread } from '../../src/agent/openai/createThread.js';
import { createRun } from '../../src/agent/openai/createRun.js';
import { performRun } from '../../src/agent/openai/performRun.js';

jest.mock('openai');
jest.mock('viem');
jest.mock('../src/agent/viem/createViemWalletClient');

describe('Token Swap Integration Flow', () => {
  const mockAssistantId = 'test-assistant-id';
  const mockThreadId = 'test-thread-id';
  const mockRunId = 'test-run-id';
  const mockUserAddress = '0x1234567890123456789012345678901234567890';
  
  let mockOpenAIInstance: jest.Mocked<OpenAI>;

  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
    
    mockOpenAIInstance = {
      beta: {
        assistants: {
          create: jest.fn().mockResolvedValue({ id: mockAssistantId, name: 'AIAgent' })
        },
        threads: {
          create: jest.fn().mockResolvedValue({ id: mockThreadId }),
          messages: {
            create: jest.fn().mockResolvedValue({}),
            list: jest.fn().mockResolvedValue({
              data: []
            })
          },
          runs: {
            create: jest.fn().mockResolvedValue({ id: mockRunId }),
            retrieve: jest.fn(), // Define this explicitly below
            submit_tool_outputs: jest.fn().mockResolvedValue({}),
            list: jest.fn().mockResolvedValue({ data: [] })
          }
        }
      }
    } as unknown as jest.Mocked<OpenAI>;
    
    // Define explicit jest.fn() implementations
    const retrieveMock = mockOpenAIInstance.beta.threads.runs.retrieve as jest.Mock;
    retrieveMock.mockResolvedValue({ status: 'completed' });
    
    // Mock the environment variables
    process.env.DISCORD_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.PRIVATE_KEY = '0xprivatekey';
  });

  it('should process a complete swap flow from command to execution', async () => {
    const swapCommand = `!swap 5 YU to YBTC
    
[System note: The Discord user is mapped to on-chain address: ${mockUserAddress}]`;

    // Mock the assistants.create to simulate creating the AI assistant
    const assistant = await createAssistant(mockOpenAIInstance);
    expect(assistant.id).toBe(mockAssistantId);
    
    // Mock thread creation with the swap command
    const thread = await createThread(mockOpenAIInstance, swapCommand);
    expect(thread.id).toBe(mockThreadId);
    expect(mockOpenAIInstance.beta.threads.create).toHaveBeenCalled();
    expect(mockOpenAIInstance.beta.threads.messages.create).toHaveBeenCalledWith({
      thread_id: mockThreadId,
      role: 'user',
      content: swapCommand
    });
    
    // Mock run creation
    const run = await createRun(mockOpenAIInstance, thread, mockAssistantId);
    expect(run.id).toBe(mockRunId);
    expect(mockOpenAIInstance.beta.threads.runs.create).toHaveBeenCalledWith({
      thread_id: mockThreadId,
      assistant_id: mockAssistantId
    });
    
    // Mock the execute_vault_swap tool call response
    const retrieveMock = mockOpenAIInstance.beta.threads.runs.retrieve as jest.Mock;
    retrieveMock.mockResolvedValueOnce({ status: 'requires_action', required_action: {
        type: 'submit_tool_outputs',
        submit_tool_outputs: {
          tool_calls: [{
            id: 'call_123',
            type: 'function',
            function: {
              name: 'execute_vault_swap',
              arguments: JSON.stringify({
                vaultAddress: '0xdfA8A83B0941F1d3ec47AD3BfEAE9D929E29b915',
                user: mockUserAddress,
                tokenIn: '0xcB856bC5Aa2664E47c9caDce6fF65117c5201a1C', // YU
                tokenOut: '0xBBd3EDd4D3b519c0d14965d9311185CFaC8c3220', // YBTC
                amountIn: '5',
                minAmountOut: '0',
                deadline: Math.floor(Date.now() / 1000) + 600
              })
            }
          }]
        }
      }})
      .mockResolvedValueOnce({ status: 'completed' });

    // Mock the executeVaultSwap tool response
    jest.mock('../../src/agent/tools/executeVaultSwap', () => ({
      executeVaultSwapTool: {
        handler: jest.fn().mockResolvedValue('Swap executed successfully. Tx hash: 0xabcdef')
      }
    }));

    // Mock the final response
    mockOpenAIInstance.beta.threads.messages.list = jest.fn().mockResolvedValue({
      data: [{
        role: 'assistant',
        content: [{ type: 'text', text: { value: 'Your swap of 5 YU to YBTC was successful! Transaction hash: 0xabcdef' } }]
      }]
    } as any);

    // Execute the run
    const result = await performRun(run, mockOpenAIInstance, thread);
    
    // Verify we got the expected response type
    expect(result).toBeDefined();
    expect(result?.type).toBe('text');
    if (result?.type === 'text') {
      expect(result.text.value).toContain('successful');
    }
  });
});

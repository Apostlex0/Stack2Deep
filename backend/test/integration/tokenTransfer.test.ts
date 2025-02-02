import { resetAllMocks } from '../mocks/mockSetup.js';
import OpenAI from 'openai';
import { createAssistant } from '../../src/agent/openai/createAssistant.js';
import { createThread } from '../../src/agent/openai/createThread.js';
import { createRun } from '../../src/agent/openai/createRun.js';
import { performRun } from '../../src/agent/openai/performRun.js';

jest.mock('openai');
jest.mock('viem');
jest.mock('../src/agent/viem/createViemWalletClient');

describe('Token Transfer Integration Flow', () => {
  const mockAssistantId = 'test-assistant-id';
  const mockThreadId = 'test-thread-id';
  const mockRunId = 'test-run-id';
  const mockRecipientAddress = '0x2345678901234567890123456789012345678901';
  
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
            create: jest.fn().mockResolvedValue({})
          },
          runs: {
            create: jest.fn().mockResolvedValue({ id: mockRunId }),
            retrieve: jest.fn().mockResolvedValue({ status: 'completed' }),
            submit_tool_outputs: jest.fn().mockResolvedValue({}),
            list: jest.fn().mockResolvedValue({ data: [] })
          }
        }
      }
    } as unknown as jest.Mocked<OpenAI>;
    
    process.env.DISCORD_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.PRIVATE_KEY = '0xprivatekey';
  });

  it('should process a token transfer command correctly', async () => {
    const transferCommand = `!send 10 YU to ${mockRecipientAddress}`;

    const assistant = await createAssistant(mockOpenAIInstance);
    expect(assistant.id).toBe(mockAssistantId);
    
    const thread = await createThread(mockOpenAIInstance, transferCommand);
    expect(thread.id).toBe(mockThreadId);
    
    const run = await createRun(mockOpenAIInstance, thread, mockAssistantId);
    expect(run.id).toBe(mockRunId);
    
    (mockOpenAIInstance.beta.threads.runs.retrieve as jest.Mock)
      .mockResolvedValue({ status: 'requires_action', required_action: {
        type: 'submit_tool_outputs',
        submit_tool_outputs: {
          tool_calls: [{
            id: 'call_123',
            type: 'function',
            function: {
              name: 'send_transaction',
              arguments: JSON.stringify({
                to: '0xcB856bC5Aa2664E47c9caDce6fF65117c5201a1C', // YU token address
                data: '0xa9059cbb0000000000000000000000002345678901234567890123456789012345678901000000000000000000000000000000000000000000000008ac7230489e80000', // encoded transfer function call
                value: '0'
              })
            }
          }]
        }
      }})
      
    (mockOpenAIInstance.beta.threads.runs.retrieve as jest.Mock)
      .mockResolvedValueOnce({ status: 'completed' });

    jest.mock('../../src/agent/tools/sendTransaction', () => ({
      sendTransactionTool: {
        handler: jest.fn().mockResolvedValue('Transaction sent successfully. Tx hash: 0xdef123')
      }
    }));

    mockOpenAIInstance.beta.threads.messages.list = jest.fn().mockResolvedValue({
      data: [{
        role: 'assistant',
        content: [{ type: 'text', text: { value: 'Your transfer of 10 YU to the recipient was successful! Transaction hash: 0xdef123' } }]
      }]
    } as any);

    const result = await performRun(run, mockOpenAIInstance, thread);
    
    expect(result).toBeDefined();
    expect(result?.type).toBe('text');
    if (result?.type === 'text') {
      expect(result.text.value).toContain('successful');
    }
  });
});

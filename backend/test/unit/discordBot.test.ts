import { mockDiscordClient, resetAllMocks } from '../mocks/mockSetup.js';
import { Message, User, TextChannel } from 'discord.js';

jest.mock('discord.js');
jest.mock('openai');
jest.mock('../../src/agent/openai/createAssistant', () => ({
  createAssistant: jest.fn().mockResolvedValue({ id: 'test-assistant-id', name: 'AIAgent' })
}));
jest.mock('../../src/agent/openai/createThread', () => ({
  createThread: jest.fn().mockResolvedValue({ id: 'test-thread-id' })
}));
jest.mock('../../src/agent/openai/createRun', () => ({
  createRun: jest.fn().mockResolvedValue({ id: 'test-run-id' })
}));
jest.mock('../../src/agent/openai/performRun', () => ({
  performRun: jest.fn().mockResolvedValue({ type: 'text', text: { value: 'AI response' } })
}));

describe('Discord Bot', () => {
  let startDiscordBot: Function;
  let mockMessage: Partial<Message>;
  // Using Partial types for easier testing
  
  beforeEach(async () => {
    resetAllMocks();
    jest.resetModules();
    
    process.env.DISCORD_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-key';
    
    // Create minimal mock objects with type assertions
    const mockUserData = {
      id: 'test-user-id',
      bot: false,
      tag: 'testuser#1234',
      username: 'testuser',
      toString: () => `<@test-user-id>`,
      // Required for test functionality
      send: jest.fn().mockResolvedValue({})
    };
    
    mockMessage = {
      author: mockUserData as unknown as User,
      content: '!test command',
      reply: jest.fn().mockResolvedValue({}),
      channel: { id: 'test-channel' } as unknown as TextChannel
    } as unknown as Partial<Message>;
    
    mockDiscordClient.on.mockImplementation((event, callback) => {
      if (event === 'messageCreate') {
        callback(mockMessage);
      }
      return mockDiscordClient;
    });
    
    mockDiscordClient.once.mockImplementation((event, callback) => {
      if (event === 'ready') {
        callback();
      }
      return mockDiscordClient;
    });
    
    mockDiscordClient.login.mockResolvedValue('login-success');
    
    const discordBotModule = await import('../../discord/discordBot.js');
    startDiscordBot = discordBotModule.startDiscordBot;
  });
  
  it('should initialize Discord client and OpenAI on startup', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    await startDiscordBot();
    
    expect(mockDiscordClient.login).toHaveBeenCalledWith('test-token');
    expect(mockDiscordClient.once).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(mockDiscordClient.on).toHaveBeenCalledWith('messageCreate', expect.any(Function));
  });
  
  it('should handle !register command correctly', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    (mockMessage.content as string) = '!register 0x1234567890123456789012345678901234567890';
    
    await startDiscordBot();
    
    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('✅ Registered your address'));
  });
  
  it('should reject invalid addresses in !register command', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    (mockMessage.content as string) = '!register invalidAddress';
    
    await startDiscordBot();
    
    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Invalid address format'));
  });
  
  it('should process !swap command with registered address', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const { createThread } = require('../../src/agent/openai/createThread');
    const { createRun } = require('../../src/agent/openai/createRun');
    const { performRun } = require('../../src/agent/openai/performRun');
    
    // First register the address
    (mockMessage.content as string) = '!register 0x1234567890123456789012345678901234567890';
    await startDiscordBot();
    
    // Then process a swap command
    (mockMessage.content as string) = '!swap 5 YU to YBTC';
    await startDiscordBot();
    
    expect(createThread).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('[System note: The Discord user is mapped to on-chain address:')
    );
    expect(createRun).toHaveBeenCalled();
    expect(performRun).toHaveBeenCalled();
    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('AI: AI response'));
  });
});

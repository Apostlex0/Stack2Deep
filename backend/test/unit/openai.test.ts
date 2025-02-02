import { mockOpenAI, resetAllMocks } from '../mocks/mockSetup.js';
import { createAssistant } from '../../agent/openai/createAssistant.js';
import { createThread } from '../../agent/openai/createThread.js';
import { createRun } from '../../agent/openai/createRun.js';

jest.mock('../../src/agent/openai/createAssistant', () => ({
  createAssistant: jest.fn()
}));

jest.mock('../../src/agent/openai/createThread', () => ({
  createThread: jest.fn()
}));

jest.mock('../../src/agent/openai/createRun', () => ({
  createRun: jest.fn()
}));

describe('OpenAI Integration', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createAssistant', () => {
    it('should create an assistant with correct parameters', async () => {
      const mockAssistant = {
        id: 'test-assistant-id',
        name: 'AIAgent'
      };
      
      // Use type assertion to handle APIPromise compatibility
      const mockPromise = Promise.resolve(mockAssistant) as any;
      mockOpenAI.beta.assistants.create.mockReturnValueOnce(mockPromise);
      
      const result = await createAssistant(mockOpenAI);
      
      expect(mockOpenAI.beta.assistants.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        name: 'AIAgent',
        instructions: expect.any(String),
        tools: expect.any(Array)
      });
      
      expect(result).toEqual(mockAssistant);
    });
  });

  describe('createThread', () => {
    it('should create a thread with the user message', async () => {
      const mockThread = { id: 'test-thread-id' };
      const userMessage = 'Test user message';
      
      // Use type assertion to handle APIPromise compatibility
      const mockThreadPromise = Promise.resolve(mockThread) as any;
      mockOpenAI.beta.threads.create.mockReturnValueOnce(mockThreadPromise);
      
      const mockMessagePromise = Promise.resolve({}) as any;
      mockOpenAI.beta.threads.messages.create.mockReturnValueOnce(mockMessagePromise);
      
      const result = await createThread(mockOpenAI, userMessage);
      
      expect(mockOpenAI.beta.threads.create).toHaveBeenCalled();
      expect(mockOpenAI.beta.threads.messages.create).toHaveBeenCalledWith({
        thread_id: 'test-thread-id',
        role: 'user',
        content: userMessage
      });
      
      expect(result).toEqual(mockThread);
    });
  });

  describe('createRun', () => {
    it('should create a run with correct parameters', async () => {
      const mockRun = { id: 'test-run-id' };
      const mockThread = { id: 'test-thread-id' };
      const assistantId = 'test-assistant-id';
      
      // Use type assertion to handle APIPromise compatibility
      const mockRunPromise = Promise.resolve(mockRun) as any;
      mockOpenAI.beta.threads.runs.create.mockReturnValueOnce(mockRunPromise);
      
      const result = await createRun(mockOpenAI, mockThread as any, assistantId);
      
      expect(mockOpenAI.beta.threads.runs.create).toHaveBeenCalledWith({
        thread_id: 'test-thread-id',
        assistant_id: assistantId
      });
      
      expect(result).toEqual(mockRun);
    });
  });
});

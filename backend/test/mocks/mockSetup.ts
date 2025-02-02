import { mock, mockDeep } from 'jest-mock-extended';
import OpenAI from 'openai';
import { Client } from 'discord.js';
import { WalletClient, PublicClient } from 'viem';

// Use mockDeep for complex nested objects like OpenAI
export const mockOpenAI = mockDeep<OpenAI>();
export const mockDiscordClient = mock<Client>();
export const mockWalletClient = mock<WalletClient>();
export const mockPublicClient = mock<PublicClient>();

export const resetAllMocks = () => {
  // For deep mocks we need to reset them differently
  jest.resetAllMocks();
};

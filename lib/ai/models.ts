export const DEFAULT_CHAT_MODEL: string = 'groq-llama4';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'GPT-4.1 Nano',
    description: 'OpenAI GPT-4.1 Nano (for general chat)',
  },
  {
    id: 'chat-model-reasoning',
    name: 'GPT-5 Nano (Thinking)',
    description: 'OpenAI GPT-5 Nano (for advanced reasoning)',
  },
  {
    id: 'groq-llama4',
    name: 'GPT-OSS-20B',
    description: 'OpenAI GPT-OSS-20B (via Groq)',
  },
];

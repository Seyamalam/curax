export const DEFAULT_CHAT_MODEL: string = 'groq-llama4';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Gemini 2.5 Flash',
    description: 'Google Gemini 2.5 Flash Preview (for general chat)',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Gemini 2.5 Flash (Thinking)',
    description: 'Google Gemini 2.5 Flash Preview (for advanced reasoning)',
  },
  {
    id: 'groq-llama4',
    name: 'Groq Llama 4 Scout',
    description: 'Meta Llama 4 Scout 17B 16E Instruct (Groq)',
  },
];

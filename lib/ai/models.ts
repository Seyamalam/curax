export const DEFAULT_CHAT_MODEL: string = 'chat-model';

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
];

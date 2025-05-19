import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { groq as groqProvider } from '@ai-sdk/groq';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!, // Make sure to set this in your environment variables
});

const groq = groqProvider;

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
        'groq-llama4': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openrouter.chat('google/gemini-2.5-flash-preview'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouter.chat('google/gemini-2.5-flash-preview:thinking'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openrouter.chat('google/gemini-2.5-flash-preview'),
        'artifact-model': openrouter.chat('google/gemini-2.5-flash-preview'),
        'groq-llama4': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      },
      imageModels: {
        // OpenRouter may not support image models directly; leave empty or update if supported
      },
    });

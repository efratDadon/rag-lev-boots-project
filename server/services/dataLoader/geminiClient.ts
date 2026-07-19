import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIMENSIONS = 768;
export const GENERATION_MODEL = 'gemini-2.5-flash-lite';

let client: GoogleGenAI | null = null;

export const getGenAI = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    client = new GoogleGenAI({ apiKey });
  }

  return client;
};

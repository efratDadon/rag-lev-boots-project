//מדבר בפועל עם המודל של גוגל ומקבל ממנו את הטקסט.
import { getGenAI, GENERATION_MODEL } from '../dataLoader/geminiClient';
import { withRetry } from '../dataLoader/withRetry';

export const generateAnswer = async (prompt: string): Promise<string> => {
  const response = await withRetry(() =>
    getGenAI().models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    })
  );

  if (!response.text) {
    throw new Error('Gemini API returned no text in the response');
  }

  return response.text;
};

// Make sure you've reviewd the README.md file to understand the task and the RAG flow

import { loadPdfData } from './dataLoader/loadPdfs';
import { loadArticles } from './dataLoader/loadArticles';
import { loadSlack } from './dataLoader/loadSlack';
import { answerQuestion } from './answerService/answer';

export const loadAllData = async () => {
  await loadPdfData();
  await loadArticles();
  await loadSlack();
};

export const ask = async (userQuestion: string): Promise<string> => {
  return answerQuestion(userQuestion);
};

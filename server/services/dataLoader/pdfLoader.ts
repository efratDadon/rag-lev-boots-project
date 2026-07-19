import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.join(__dirname, '../../knowledge_pdfs');

export interface RawDocument {
  sourceId: string;
  text: string;
}

export const loadPdfDocuments = async (): Promise<RawDocument[]> => {
  const files = (await readdir(PDF_DIR)).filter((file) =>
    file.toLowerCase().endsWith('.pdf')
  );

  const documents: RawDocument[] = [];

  for (const file of files) {
    const buffer = await readFile(path.join(PDF_DIR, file));
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      documents.push({ sourceId: file, text: result.text });
    } finally {
      await parser.destroy();
    }
  }

  return documents;
};

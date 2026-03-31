import { PDFDocument } from 'pdf-lib';
import type { MergeFile } from '../types';

export async function mergePdfs(files: MergeFile[]): Promise<{ blob: Blob; totalPages: number }> {
  const outDoc = await PDFDocument.create();
  let totalPages = 0;

  for (const f of files) {
    const srcDoc = await PDFDocument.load(f.buffer);
    const indices = srcDoc.getPageIndices();
    const copiedPages = await outDoc.copyPages(srcDoc, indices);
    copiedPages.forEach(p => outDoc.addPage(p));
    totalPages += indices.length;
  }

  const pdfBytes = await outDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  return { blob, totalPages };
}

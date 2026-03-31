import { PDFDocument, rgb } from 'pdf-lib';
import type { LabelInfo } from '../types';

export async function generateLabelPrinterPdf(
  sourceArrayBuffer: ArrayBuffer,
  labels: LabelInfo[]
): Promise<Blob> {
  const srcDoc = await PDFDocument.load(sourceArrayBuffer);
  const outDoc = await PDFDocument.create();

  // Standard 4x6 inch thermal label size in points
  const LABEL_W = 288; // 4 inches * 72 pt
  const LABEL_H = 432; // 6 inches * 72 pt

  for (const label of labels) {
    const crop = label.cropBounds;
    const srcPage = srcDoc.getPage(label.pageIndex);

    // Embed only the cropped region from the source page
    const embedded = await outDoc.embedPage(srcPage, {
      left: crop.x,
      bottom: crop.y,
      right: crop.x + crop.width,
      top: crop.y + crop.height,
    });

    // Create a new 4x6 page and scale the label to fit
    const page = outDoc.addPage([LABEL_W, LABEL_H]);

    const scaleX = LABEL_W / crop.width;
    const scaleY = LABEL_H / crop.height;
    const scale = Math.min(scaleX, scaleY);
    const dw = crop.width * scale;
    const dh = crop.height * scale;

    // Center the label on the 4x6 page
    const xPos = (LABEL_W - dw) / 2;
    const yPos = (LABEL_H - dh) / 2;

    page.drawPage(embedded, { x: xPos, y: yPos, width: dw, height: dh });
  }

  const pdfBytes = await outDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function generateA4PrinterPdf(
  sourceArrayBuffer: ArrayBuffer,
  labels: LabelInfo[]
): Promise<Blob> {
  const srcDoc = await PDFDocument.load(sourceArrayBuffer);
  const outDoc = await PDFDocument.create();

  const A4_W = 595.28;
  const A4_H = 841.89;
  const COLS = 2;
  const ROWS = 2;
  const PER_PAGE = 4;
  const M = 10;
  const cellW = (A4_W - M * 3) / COLS;
  const cellH = (A4_H - M * 3) / ROWS;

  for (let i = 0; i < labels.length; i += PER_PAGE) {
    const page = outDoc.addPage([A4_W, A4_H]);
    const batch = labels.slice(i, i + PER_PAGE);

    for (let j = 0; j < batch.length; j++) {
      const label = batch[j];
      const col = j % COLS;
      const row = Math.floor(j / COLS);
      const crop = label.cropBounds;

      // Embed only the cropped region
      const srcPage = srcDoc.getPage(label.pageIndex);
      const embedded = await outDoc.embedPage(srcPage, {
        left: crop.x,
        bottom: crop.y,
        right: crop.x + crop.width,
        top: crop.y + crop.height,
      });

      const scaleX = cellW / crop.width;
      const scaleY = cellH / crop.height;
      const scale = Math.min(scaleX, scaleY);
      const dw = crop.width * scale;
      const dh = crop.height * scale;

      const xPos = M + col * (cellW + M) + (cellW - dw) / 2;
      const yPos = A4_H - M - (row + 1) * cellH - row * M + (cellH - dh) / 2;

      page.drawPage(embedded, { x: xPos, y: yPos, width: dw, height: dh });

      // Border
      const cx = M + col * (cellW + M);
      const cy = A4_H - M - (row + 1) * cellH - row * M;
      page.drawRectangle({
        x: cx,
        y: cy,
        width: cellW,
        height: cellH,
        borderWidth: 0.5,
        borderColor: rgb(0.7, 0.7, 0.7),
        opacity: 0,
      });
    }
  }

  const pdfBytes = await outDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

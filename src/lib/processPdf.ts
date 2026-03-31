import { pdfjsLib } from './pdfSetup';
import { detectLabel, extractSKU, extractQuantity, extractOrderNo, detectCourier, isInvoicePage } from './labelDetection';
import { calculateCropBounds } from './cropBounds';
import type { Platform, LabelInfo } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfDocument = any;

export async function processPdf(arrayBuffer: ArrayBuffer, platform: Platform): Promise<LabelInfo[]> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  if (platform === 'amazon') {
    return await processAmazon(pdf);
  }

  if (platform === 'meesho-invoice') {
    return await processMeeshoWithInvoice(pdf);
  }

  const labels: LabelInfo[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    const fullText = items.map(item => item.str).join(' ');

    if (!detectLabel(fullText, platform)) continue;

    const sku = extractSKU(items, fullText);
    const qty = extractQuantity(fullText, items);
    const orderNo = extractOrderNo(fullText);
    const courier = detectCourier(fullText);
    const cropBounds = calculateCropBounds(pageWidth, pageHeight, items, fullText, platform);

    labels.push({
      pageIndex: pageNum - 1,
      pageNum,
      width: pageWidth,
      height: pageHeight,
      sku, qty, orderNo, courier, cropBounds,
    });
  }

  labels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
  return labels;
}

async function processAmazon(pdf: PdfDocument): Promise<LabelInfo[]> {
  const labels: LabelInfo[] = [];
  const labelPages: number[] = [];

  // Pass 1: classify pages — skip invoice pages, keep label pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    const fullText = items.map(item => item.str).join(' ');

    // Skip pages that are clearly invoices
    if (isInvoicePage(fullText)) continue;

    const sku = extractSKU(items, fullText);
    const qty = extractQuantity(fullText, items);
    const orderNo = extractOrderNo(fullText);
    const courier = detectCourier(fullText);

    // Amazon labels are full pages — no cropping needed
    const cropBounds = { x: 0, y: 0, width: viewport.width, height: viewport.height };

    labels.push({
      pageIndex: pageNum - 1,
      pageNum,
      width: viewport.width,
      height: viewport.height,
      sku, qty, orderNo, courier, cropBounds,
    });
    labelPages.push(pageNum);
  }

  // Fallback: if no label pages found (text extraction failed on label pages),
  // keep odd-numbered pages (Amazon alternates: label, invoice, label, invoice...)
  if (labels.length === 0) {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 2) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{ str: string; transform: number[] }>;
      const fullText = items.map(item => item.str).join(' ');

      labels.push({
        pageIndex: pageNum - 1,
        pageNum,
        width: viewport.width,
        height: viewport.height,
        sku: extractSKU(items, fullText),
        qty: extractQuantity(fullText),
        orderNo: extractOrderNo(fullText),
        courier: detectCourier(fullText),
        cropBounds: { x: 0, y: 0, width: viewport.width, height: viewport.height },
      });
    }
  }

  labels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
  return labels;
}

async function processMeeshoWithInvoice(pdf: PdfDocument): Promise<LabelInfo[]> {
  const labels: LabelInfo[] = [];

  interface PageData {
    pageNum: number;
    pageIndex: number;
    width: number;
    height: number;
    items: Array<{ str: string; transform: number[] }>;
    fullText: string;
    isInvoice: boolean;
    isLabel: boolean;
  }

  const pageData: PageData[] = [];

  // Pass 1: classify each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    const fullText = items.map(item => item.str).join(' ');

    pageData.push({
      pageNum,
      pageIndex: pageNum - 1,
      width: viewport.width,
      height: viewport.height,
      items, fullText,
      isInvoice: isInvoicePage(fullText),
      isLabel: detectLabel(fullText, 'meesho'),
    });
  }

  // Pass 2: extract labels — skip pure invoice pages
  for (const pd of pageData) {
    if (pd.isInvoice && !pd.isLabel) continue;

    const sku = extractSKU(pd.items, pd.fullText);
    const qty = extractQuantity(pd.fullText, pd.items);
    const orderNo = extractOrderNo(pd.fullText);
    const courier = detectCourier(pd.fullText);
    const cropBounds = calculateCropBounds(pd.width, pd.height, pd.items, pd.fullText, 'meesho');

    labels.push({
      pageIndex: pd.pageIndex,
      pageNum: pd.pageNum,
      width: pd.width,
      height: pd.height,
      sku, qty, orderNo, courier, cropBounds,
    });
  }

  labels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
  return labels;
}

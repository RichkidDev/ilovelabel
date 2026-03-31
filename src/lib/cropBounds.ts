import type { Platform, CropBounds } from '../types';

interface TextItem {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
}

export function calculateCropBounds(
  pageWidth: number,
  pageHeight: number,
  items: TextItem[],
  _fullText: string,
  platform: Platform
): CropBounds {
  // Amazon: full page (page selection is handled in processPdf)
  if (platform === 'amazon') {
    return { x: 0, y: 0, width: pageWidth, height: pageHeight };
  }

  // Small pages are already label-sized
  if (pageHeight <= 500) {
    return { x: 0, y: 0, width: pageWidth, height: pageHeight };
  }

  // Find "TAX INVOICE" / "Tax Invoice" boundary — the most reliable marker
  // In PDF coords, Y=0 is at bottom. The label is at the TOP of the page (higher Y).
  // We want everything ABOVE the invoice text.
  let boundaryY = -1;

  for (const item of items) {
    const str = item.str;
    if (
      (str.includes('TAX INVOICE') || str.includes('Tax Invoice') || str === 'Tax') &&
      item.transform && item.transform[5] != null
    ) {
      const y = item.transform[5];
      if (boundaryY === -1 || y > boundaryY) {
        boundaryY = y;
      }
    }
  }

  // If no TAX INVOICE marker found, use percentage-based split
  if (boundaryY <= 0) {
    const splitRatio = platform === 'flipkart' ? 0.45 : 0.50;
    boundaryY = pageHeight * splitRatio;
  } else {
    // Skip past the invoice header row (Tax Invoice | Order Id | Invoice No | GSTIN)
    // These items sit at the same Y as the boundary marker — add offset to exclude them
    boundaryY += 15;
  }

  // Collect all text items in the label region (above boundary)
  const labelItems = items.filter(item => {
    if (!item.transform || item.transform[5] == null) return false;
    const y = item.transform[5];
    return y > boundaryY && item.str.trim().length > 0;
  });

  if (labelItems.length === 0) {
    return {
      x: 0,
      y: boundaryY,
      width: pageWidth,
      height: pageHeight - boundaryY,
    };
  }

  // Calculate tight bounds from text positions using actual width when available
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const item of labelItems) {
    const x = item.transform[4];
    const y = item.transform[5];
    const fontSize = Math.abs(item.transform[3]) || Math.abs(item.transform[0]) || 10;

    // Use actual width from pdfjs when available, otherwise estimate
    const textWidth = item.width || (item.str.length * fontSize * 0.5);

    if (x < minX) minX = x;
    if (x + textWidth > maxX) maxX = x + textWidth;
    if (y < minY) minY = y;
    if (y + fontSize > maxY) maxY = y + fontSize;
  }

  // Add padding for barcodes and graphical elements that pdfjs can't detect as text
  const PAD_LEFT = 25;
  const PAD_RIGHT = 15;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 10;

  minX = Math.max(0, minX - PAD_LEFT);
  maxX = Math.min(pageWidth, maxX + PAD_RIGHT);
  minY = Math.max(0, minY - PAD_BOTTOM);
  maxY = Math.min(pageHeight, maxY + PAD_TOP);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

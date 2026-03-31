import type { Platform } from '../types';

interface TextItem {
  str: string;
  transform: number[];
}

export function detectLabel(fullText: string, platform: Platform): boolean {
  const commonMarkers = [
    'SKU:', 'Quantity:', 'Order No', 'Ecom Express', 'Delhivery',
    'Shadowfax', 'Xpress Bees', 'Ekart',
  ];

  const platformMarkers: Record<string, string[]> = {
    flipkart: ['TAX INVOICE', 'Sold By', 'sold by', 'FLIPKART', 'Flipkart', 'This order has', ...commonMarkers],
    meesho: ['Meesho', 'MEESHO', 'This order has', 'Return', ...commonMarkers],
    'meesho-invoice': ['Meesho', 'MEESHO', 'This order has', 'invoice', 'Return', ...commonMarkers],
    amazon: [
      'Amazon', 'AMAZON', 'amazon.in', 'amazon.com', 'Ship From', 'SHIP FROM',
      'Sold By', 'sold by', 'Easy Ship', 'FBA', 'Fulfilled by Amazon', ...commonMarkers,
    ],
  };

  const markers = platformMarkers[platform] || commonMarkers;
  return markers.some(m => fullText.includes(m));
}

export function extractSKU(items: TextItem[], fullText: string): string {
  // Strategy 1: "SKU:" with value inline or next item
  for (let i = 0; i < items.length; i++) {
    if (items[i].str.includes('SKU:')) {
      let sku = items[i].str.split('SKU:')[1] || '';
      if (!sku.trim() && i + 1 < items.length) {
        sku = items[i + 1].str;
        if (i + 2 < items.length && items[i + 2].str.trim()) sku += items[i + 2].str;
      }
      return sku.trim().split(/\s+/)[0];
    }
  }

  // Strategy 2: "SKU" as column header (Meesho tabular layout)
  // Find the "SKU" header item and look for value directly below it (same X, lower Y)
  for (let i = 0; i < items.length; i++) {
    if (items[i].str.trim() === 'SKU' && items[i].transform) {
      const headerX = items[i].transform[4];
      const headerY = items[i].transform[5];
      // Find the item at approximately the same X but below (lower Y in PDF coords)
      let bestMatch = '';
      let bestDist = Infinity;
      for (let j = 0; j < items.length; j++) {
        if (j === i || !items[j].str.trim() || !items[j].transform) continue;
        const dx = Math.abs(items[j].transform[4] - headerX);
        const dy = headerY - items[j].transform[5]; // positive = below header
        if (dx < 5 && dy > 0 && dy < 50 && dy < bestDist) {
          bestDist = dy;
          bestMatch = items[j].str.trim();
        }
      }
      if (bestMatch) return bestMatch.split(/\s+/)[0];
    }
  }

  // Strategy 3: regex fallback
  const match = fullText.match(/SKU:\s*([A-Za-z0-9_\-]+)/);
  return match ? match[1] : '';
}

export function extractQuantity(fullText: string, items?: TextItem[]): number {
  let m = fullText.match(/Quantity:\s*(\d+)/i);
  if (m) return parseInt(m[1]);
  m = fullText.match(/Qty\s*[:\s]*(\d+)/i);
  if (m) return parseInt(m[1]);

  // Tabular layout: "Qty" header with value below (Meesho)
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].str.trim() === 'Qty' && items[i].transform) {
        const headerX = items[i].transform[4];
        const headerY = items[i].transform[5];
        for (let j = 0; j < items.length; j++) {
          if (j === i || !items[j].transform) continue;
          const dx = Math.abs(items[j].transform[4] - headerX);
          const dy = headerY - items[j].transform[5];
          if (dx < 5 && dy > 0 && dy < 50) {
            const val = parseInt(items[j].str.trim());
            if (!isNaN(val)) return val;
          }
        }
      }
    }
  }

  return 1;
}

export function extractOrderNo(fullText: string): string {
  const m = fullText.match(/Order\s*(?:No|ID|Number)\.?\s*[:\s]*([A-Za-z0-9\-]+)/i);
  return m ? m[1] : '';
}

export function isInvoicePage(fullText: string): boolean {
  const lower = fullText.toLowerCase();
  if (lower.includes('tax invoice')) return true;
  if (lower.includes('bill of supply')) return true;
  if ((lower.includes('invoice no') || lower.includes('invoice number')) && lower.includes('hsn')) return true;
  return false;
}

export function detectCourier(fullText: string): string {
  const couriers = [
    'Ecom Express', 'Delhivery', 'Shadowfax', 'Xpress Bees',
    'Ekart', 'BlueDart', 'DTDC', 'India Post', 'Amazon Shipping',
  ];
  for (const c of couriers) {
    if (fullText.toLowerCase().includes(c.toLowerCase())) return c;
  }
  return '';
}

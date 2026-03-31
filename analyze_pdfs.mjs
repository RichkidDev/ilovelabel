import fs from 'fs';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function analyzePdf(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`FILE: ${filePath}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total Pages: ${pdf.numPages}\n`);
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    console.log(`\nPAGE ${pageNum}:`);
    console.log(`  Dimensions: ${viewport.width.toFixed(0)} x ${viewport.height.toFixed(0)} pt`);
    console.log(`  Text items: ${items.length}`);
    
    // Find key markers and their Y positions
    console.log(`\n  Key markers found:`);
    
    const markers = {};
    items.forEach((item, idx) => {
      const str = (item.str || '').trim();
      const y = item.transform ? item.transform[5] : null;
      
      if (str.includes('TAX INVOICE') || str.includes('Tax Invoice')) {
        markers['TAX INVOICE'] = y;
      }
      if (str.includes('Sold By') || str.includes('sold by')) {
        markers['Sold By'] = y;
      }
      if (str.includes('Ship From') || str.includes('SHIP FROM')) {
        markers['Ship From'] = y;
      }
      if (str.includes('SKU')) {
        markers['SKU'] = y;
      }
      if (str.includes('Order No') || str.includes('Order Number')) {
        markers['Order No'] = y;
      }
      if (str.includes('Return') && pageNum === 1) {
        markers['Return'] = y;
      }
      if (str.includes('This order has')) {
        markers['This order has'] = y;
      }
    });
    
    Object.entries(markers).sort((a, b) => (b[1] || 0) - (a[1] || 0)).forEach(([marker, y]) => {
      if (y !== null && y !== undefined) {
        console.log(`    "${marker}": Y=${y.toFixed(0)}`);
      }
    });
    
    // Show content layout
    console.log(`\n  Content analysis:`);
    const minY = Math.min(...items.map(i => i.transform?.[5] || 0).filter(y => y > 0));
    const maxY = Math.max(...items.map(i => i.transform?.[5] || 0));
    
    // Split into regions - label should be in bottom portion
    const labelZone = items.filter(i => (i.transform?.[5] || 0) > maxY - 450);
    const invoiceZone = items.filter(i => (i.transform?.[5] || 0) <= maxY - 450);
    
    console.log(`    Approximate label zone (bottom ~450pt from max Y=${maxY.toFixed(0)}): ${labelZone.length} items`);
    console.log(`    Approximate invoice zone (top): ${invoiceZone.length} items`);
    
    // Sample text from each region
    const labelText = labelZone.slice(0, 20).map(i => (i.str || '').trim()).filter(s => s).join(' ');
    const invoiceText = invoiceZone.slice(0, 20).map(i => (i.str || '').trim()).filter(s => s).join(' ');
    
    console.log(`    Label zone sample: ${labelText.substring(0, 100)}`);
    console.log(`    Invoice zone sample: ${invoiceText.substring(0, 100)}`);
  }
}

async function main() {
  const pdfs = [
    'D:/Buisness/Invoice/Dec 2025/Amazon/1.pdf',
    'D:/Buisness/Invoice/Dec 2025/Flipkart/1.pdf',
    'D:/Buisness/Invoice/Dec 2025/Meesho/1.pdf'
  ];
  
  for (const pdf of pdfs) {
    try {
      await analyzePdf(pdf);
    } catch (err) {
      console.error(`Error reading ${pdf}: ${err.message}`);
    }
  }
}

main().catch(console.error);

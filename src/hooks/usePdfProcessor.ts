import { useState, useCallback } from 'react';
import { processPdf } from '../lib/processPdf';
import { generateLabelPrinterPdf, generateA4PrinterPdf } from '../lib/generatePdf';
import { mergePdfs } from '../lib/mergePdf';
import type { Platform, PrinterType, LabelInfo, SkuSummary } from '../types';

type Status = 'idle' | 'processing' | 'done' | 'error';

interface PdfFile {
  name: string;
  buffer: ArrayBuffer;
}

interface IndividualResult {
  name: string;
  blob: Blob;
  labelCount: number;
}

export function usePdfProcessor(platform: Platform) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [printerType, setPrinterType] = useState<PrinterType>('lbl');
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [labels, setLabels] = useState<LabelInfo[]>([]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [individualResults, setIndividualResults] = useState<IndividualResult[]>([]);
  const [skuSummary, setSkuSummary] = useState<SkuSummary[]>([]);

  const resetState = useCallback(() => {
    setStatus('idle');
    setStatusMessage('');
    setResultBlob(null);
    setIndividualResults([]);
    setLabels([]);
    setSkuSummary([]);
  }, []);

  const setFile = useCallback((file: File) => {
    setFileNames([file.name]);
    resetState();
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfFiles([{ name: file.name, buffer: e.target?.result as ArrayBuffer }]);
    };
    reader.readAsArrayBuffer(file);
  }, [resetState]);

  const setFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setFileNames(files.map(f => f.name));
    resetState();
    let loaded = 0;
    const results: PdfFile[] = new Array(files.length);
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        results[idx] = { name: file.name, buffer: e.target?.result as ArrayBuffer };
        loaded++;
        if (loaded === files.length) setPdfFiles(results);
      };
      reader.readAsArrayBuffer(file);
    });
  }, [resetState]);

  const prepare = useCallback(async () => {
    if (pdfFiles.length === 0) return;

    setStatus('processing');
    setStatusMessage(`Processing ${pdfFiles.length} PDF(s)...`);
    setResultBlob(null);
    setIndividualResults([]);

    try {
      const isMultiple = pdfFiles.length > 1;
      let allLabels: LabelInfo[] = [];

      if (isMultiple) {
        // Multiple files: process each, collect all labels
        for (let i = 0; i < pdfFiles.length; i++) {
          const file = pdfFiles[i];
          setStatusMessage(`Processing file ${i + 1}/${pdfFiles.length}: ${file.name}`);
          const bufCopy = file.buffer.slice(0);
          const fileLabels = await processPdf(bufCopy, platform);
          allLabels = allLabels.concat(fileLabels);
        }
      } else {
        const bufCopy = pdfFiles[0].buffer.slice(0);
        allLabels = await processPdf(bufCopy, platform);
      }

      if (allLabels.length === 0) {
        setStatus('error');
        setStatusMessage(`No shipping labels detected. Check that the PDF(s) are valid ${platform} shipping labels.`);
        return;
      }

      // Sort all labels by SKU
      allLabels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
      setLabels(allLabels);

      // --- Generate merged output (all labels in one PDF) ---
      setStatusMessage(`Found ${allLabels.length} label(s). Generating output...`);

      let sourceBuffer: ArrayBuffer;
      if (isMultiple) {
        const mergeResult = await mergePdfs(
          pdfFiles.map(f => ({ name: f.name, buffer: f.buffer.slice(0) }))
        );
        sourceBuffer = await mergeResult.blob.arrayBuffer();
        // Re-process merged PDF to get correct page indices
        const mergedLabels = await processPdf(sourceBuffer.slice(0), platform);
        mergedLabels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));

        const genBuf = sourceBuffer.slice(0);
        const blob = printerType === 'lbl'
          ? await generateLabelPrinterPdf(genBuf, mergedLabels)
          : await generateA4PrinterPdf(genBuf, mergedLabels);
        setResultBlob(blob);
      } else {
        const genBuf = pdfFiles[0].buffer.slice(0);
        const blob = printerType === 'lbl'
          ? await generateLabelPrinterPdf(genBuf, allLabels)
          : await generateA4PrinterPdf(genBuf, allLabels);
        setResultBlob(blob);
      }

      // --- Generate individual label PDFs (one per label) ---
      if (allLabels.length > 1) {
        const perLabelResults: IndividualResult[] = [];
        // For individual labels, use the original source buffer(s)
        // For single file: generate one PDF per label from the same source
        // For multiple files: use merged source
        const srcBuf = isMultiple
          ? sourceBuffer!
          : pdfFiles[0].buffer.slice(0);

        const srcLabels = isMultiple
          ? await processPdf(srcBuf.slice(0), platform)
          : allLabels;

        srcLabels.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));

        for (let i = 0; i < srcLabels.length; i++) {
          const label = srcLabels[i];
          const genBuf = srcBuf.slice(0);
          const blob = printerType === 'lbl'
            ? await generateLabelPrinterPdf(genBuf, [label])
            : await generateA4PrinterPdf(genBuf, [label]);

          const labelName = label.sku
            ? `${label.sku}-label-${i + 1}.pdf`
            : `label-${i + 1}.pdf`;

          perLabelResults.push({
            name: labelName,
            blob,
            labelCount: 1,
          });
        }

        setIndividualResults(perLabelResults);
      }

      // Compute SKU summary
      const skuMap: Record<string, { qty: number; count: number }> = {};
      allLabels.forEach(l => {
        const sku = l.sku || 'Unknown';
        if (!skuMap[sku]) skuMap[sku] = { qty: 0, count: 0 };
        skuMap[sku].qty += l.qty || 1;
        skuMap[sku].count++;
      });
      const summary = Object.entries(skuMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([sku, d]) => ({ sku, qty: d.qty, count: d.count }));

      setSkuSummary(summary);
      setStatus('done');
      setStatusMessage('');
    } catch (err) {
      setStatus('error');
      setStatusMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [pdfFiles, platform, printerType]);

  const downloadMerged = useCallback(() => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}-labels-merged-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob, platform]);

  const downloadIndividual = useCallback(() => {
    individualResults.forEach((file, i) => {
      setTimeout(() => {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }, i * 200); // Small delay between downloads to avoid browser blocking
    });
  }, [individualResults]);

  const displayName = fileNames.length === 0
    ? null
    : fileNames.length === 1
      ? fileNames[0]
      : `${fileNames.length} files selected`;

  return {
    fileName: displayName,
    hasFiles: pdfFiles.length > 0,
    isBulk: pdfFiles.length > 1,
    printerType,
    status,
    statusMessage,
    labels,
    resultBlob,
    individualResults,
    skuSummary,
    setFile,
    setFiles,
    setPrinterType,
    prepare,
    downloadMerged,
    downloadIndividual,
  };
}

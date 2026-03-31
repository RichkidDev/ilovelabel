import { useState, type DragEvent } from 'react';
import UploadArea from './UploadArea';
import { mergePdfs } from '../lib/mergePdf';
import type { MergeFile } from '../types';

export default function MergePdfPanel() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSummary, setResultSummary] = useState('');

  const addFiles = (inputFiles: File[]) => {
    inputFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        setFiles(prev => [...prev, { name: f.name, buffer: e.target?.result as ArrayBuffer }]);
        setResultBlob(null);
      };
      reader.readAsArrayBuffer(f);
    });
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setResultBlob(null);
  };

  const handleDragStart = (e: DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDrop = (e: DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIdx !== toIdx) {
      setFiles(prev => {
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    setStatusMessage(`Merging ${files.length} PDFs...`);
    setIsError(false);
    setResultBlob(null);

    try {
      const { blob, totalPages } = await mergePdfs(files);
      setResultBlob(blob);
      setResultSummary(`Merged ${files.length} files (${totalPages} pages total).`);
      setStatusMessage('');
    } catch (err) {
      setIsError(true);
      setStatusMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-labels-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h5 className="text-center mb-1">
        Merge PDF Tool <span className="platform-badge badge-auto">Merge</span>
      </h5>
      <p className="text-center text-muted mb-3 info-text">
        Combine multiple PDF files into one. Drag to reorder.
      </p>

      <UploadArea
        onFileSelected={() => {}}
        multiple
        onMultipleFiles={addFiles}
      />

      {files.length > 0 && (
        <div className="merge-file-list mt-3">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="merge-file-item"
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, i)}
            >
              <span className="drag-handle">&#9776;</span>
              <span>{i + 1}. {f.name}</span>
              <span className="remove-btn" onClick={() => removeFile(i)}>&times;</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-3">
        <button
          className="btn btn-prepare"
          disabled={files.length < 2 || loading}
          onClick={handleMerge}
        >
          {loading && <span className="spinner-border text-light me-2" role="status" />}
          Merge PDFs
        </button>
      </div>

      {statusMessage && (
        <div className="text-center mt-3">
          <p className={`mb-0 ${isError ? 'text-danger' : 'text-muted'}`}>{statusMessage}</p>
        </div>
      )}

      {resultBlob && (
        <div className="result-card mt-4">
          <h5>PDF Merged!</h5>
          <p className="mb-2">{resultSummary}</p>
          <div className="text-center">
            <button className="btn btn-download" onClick={handleDownload}>
              Download Merged PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

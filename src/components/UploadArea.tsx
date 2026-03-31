import { useRef, useState, type DragEvent } from 'react';

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  fileName?: string | null;
  accept?: string;
  multiple?: boolean;
  onMultipleFiles?: (files: File[]) => void;
}

export default function UploadArea({
  onFileSelected,
  fileName,
  accept = '.pdf',
  multiple = false,
  onMultipleFiles,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (multiple && onMultipleFiles) {
      onMultipleFiles(files);
    } else if (files[0]) {
      onFileSelected(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (multiple && onMultipleFiles) {
      onMultipleFiles(files);
    } else if (files[0]) {
      onFileSelected(files[0]);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`upload-area${dragOver ? ' dragover' : ''}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
        <path d="M12 12l-4 4h2.5v3h3v-3H16z" />
      </svg>
      <div className="text-muted">
        Drag & drop PDF{multiple ? 's' : ''} here, or <strong>click to browse</strong>
      </div>
      {fileName && <div className="file-name">{fileName}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}

import { usePdfProcessor } from '../hooks/usePdfProcessor';
import UploadArea from './UploadArea';
import PrepareButton from './PrepareButton';
import StatusMessage from './StatusMessage';
import ResultCard from './ResultCard';
import type { Platform } from '../types';

interface CropToolPanelProps {
  platform: Platform;
  title: string;
  badge: { text: string; className: string };
  description: string;
}

export default function CropToolPanel({ platform, title, badge, description }: CropToolPanelProps) {
  const {
    fileName,
    hasFiles,
    isBulk,
    status,
    statusMessage,
    labels,
    individualResults,
    skuSummary,
    setFile,
    setFiles,
    prepare,
    downloadMerged,
    downloadIndividual,
  } = usePdfProcessor(platform);

  return (
    <div>
      <h5 className="text-center mb-1">
        {title} <span className={`platform-badge ${badge.className}`}>{badge.text}</span>
      </h5>
      <p className="text-center text-muted mb-3 info-text">{description}</p>

      <UploadArea
        onFileSelected={setFile}
        onMultipleFiles={setFiles}
        fileName={fileName}
        multiple
      />

      <PrepareButton
        disabled={!hasFiles}
        loading={status === 'processing'}
        onClick={prepare}
      />

      {status === 'processing' && (
        <StatusMessage message={statusMessage} type="info" />
      )}

      {status === 'error' && (
        <StatusMessage message={statusMessage} type="error" />
      )}

      {status === 'done' && (
        <ResultCard
          summary={`${labels.length} label(s) cropped and ready.`}
          skuData={skuSummary}
          onDownloadMerged={downloadMerged}
          onDownloadIndividual={downloadIndividual}
          hasMultipleLabels={individualResults.length > 0}
          individualCount={individualResults.length}
        />
      )}
    </div>
  );
}

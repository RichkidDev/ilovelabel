import type { SkuSummary } from '../types';

interface ResultCardProps {
  summary: string;
  skuData: SkuSummary[];
  onDownloadMerged: () => void;
  onDownloadIndividual?: () => void;
  hasMultipleLabels?: boolean;
  individualCount?: number;
}

export default function ResultCard({
  summary,
  skuData,
  onDownloadMerged,
  onDownloadIndividual,
  hasMultipleLabels = false,
  individualCount = 0,
}: ResultCardProps) {
  const showTable = skuData.length > 0 && !(skuData.length === 1 && skuData[0].sku === 'Unknown');

  return (
    <div className="result-card mt-4">
      <h5>Labels Ready!</h5>
      <p className="mb-3">{summary}</p>

      {showTable && (
        <table className="table table-sm sku-table mb-3">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Qty</th>
              <th>Labels</th>
            </tr>
          </thead>
          <tbody>
            {skuData.map(row => (
              <tr key={row.sku}>
                <td>{row.sku}</td>
                <td>{row.qty}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="download-section">
        {hasMultipleLabels ? (
          <>
            <button className="btn btn-download download-btn-full" onClick={onDownloadMerged}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
              </svg>
              All Labels in One PDF
            </button>
            <button className="btn btn-download btn-download-alt download-btn-full" onClick={onDownloadIndividual}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
              </svg>
              Individual Labels ({individualCount})
            </button>
          </>
        ) : (
          <button className="btn btn-download download-btn-full" onClick={onDownloadMerged}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Cropped Label
          </button>
        )}
      </div>
    </div>
  );
}

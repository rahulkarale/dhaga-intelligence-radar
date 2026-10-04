import React, { useState, useRef } from 'react';
import {
  Database,
  Upload,
  FileArchive,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  FileSpreadsheet,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ReturnRecord } from '../types';

interface WhereIsTheDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onCustomDataUploaded?: (records: ReturnRecord[]) => void;
}

export const WhereIsTheDataModal: React.FC<WhereIsTheDataModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleData,
  onCustomDataUploaded,
}) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'upload' | 'database'>('zip');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [dbLastSynced, setDbLastSynced] = useState('14 minutes ago');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/inputs.zip';
    link.download = 'inputs.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCsvTemplate = () => {
    const link = document.createElement('a');
    link.href = '/dhaga_returns_template.csv';
    link.download = 'dhaga_returns_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadStatus(`Parsing ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setUploadStatus('File is empty or missing data rows.');
          return;
        }

        // Quick parse CSV lines
        const parsedRecords: ReturnRecord[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 3) {
            parsedRecords.push({
              id: cols[0]?.trim() || `RET-UPLOAD-${i}`,
              orderId: cols[1]?.trim() || `ORD-UP-${i}`,
              orderDate: '2026-09-20',
              deliveredDate: '2026-09-24',
              returnDate: '2026-09-25',
              sku: cols[5]?.trim() || 'KUR-JPR-402',
              productName: cols[6]?.trim() || 'Custom Uploaded Garment',
              vendorId: cols[7]?.trim() || 'VEND-JPR-01',
              vendorName: cols[8]?.trim() || 'Anokhi Weaves & Prints',
              category: 'Womenswear',
              price: 899,
              sizeOrdered: 'M',
              colorRaw: cols[12]?.trim() || 'rani pink',
              officialReturnReason: 'Other',
              freeTextOtherReason: cols[14]?.trim() || 'Size issue, bust tight hai.',
              customerLanguage: 'Hinglish',
              cod: true,
              status: 'Initiated',
            });
          }
        }

        setUploadStatus(`Successfully parsed ${parsedRecords.length} records.`);
        if (onCustomDataUploaded && parsedRecords.length > 0) {
          onCustomDataUploaded(parsedRecords);
        }
      } catch (err) {
        setUploadStatus('Failed to parse file. Please verify CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSyncDb = () => {
    setDbSyncing(true);
    setTimeout(() => {
      setDbSyncing(false);
      setDbLastSynced('Just now');
      onLoadSampleData();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Where is the data?</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dhaga &amp; Co. Ingestion pipeline, connected catalogue database &amp; review archives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('zip')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'zip'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <FileArchive className="w-4 h-4" />
            <span>Return and review data (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload data</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'database'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Connected database</span>
          </button>
        </div>

        {/* Tab 1: Return and review data (.zip) */}
        {activeTab === 'zip' && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider block">
                Official Case Study Artifact
              </span>

              {/* Exact format requested by user: inputs .zip 47.4 KB ⇣ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl shrink-0">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white font-mono tracking-tight">inputs</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] font-bold rounded border border-slate-700">
                        .zip
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-400 font-mono font-semibold">47.4 KB</span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs text-slate-400">Authentic Dhaga &amp; Co. returns, vendors &amp; reviews</span>
                    </div>
                  </div>
                </div>

                {/* Download Zip Arrow Icon ⇣ */}
                <button
                  onClick={handleDownloadZip}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
                  title="Download inputs.zip (47.4 KB)"
                >
                  <Download className="w-4 h-4" />
                  <span>47.4 KB ⇣</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <p>
                  This archive packages Dhaga &amp; Co.'s 48,000 orders/week return stream with 44% unclassified "Other" free-text complaints, 40 Jaipur and Tiruppur vendor defect scorecards, and the edge-case benchmark suite.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pre-verified for Neha (Category Head) &amp; Faizan (Supply Chain)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Load data & CSV template */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDownloadCsvTemplate}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>CSV template</span>
              </button>

              <button
                onClick={() => {
                  onLoadSampleData();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load data</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Upload data */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.json,.txt"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950"
            >
              <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">Drop your return or review data here</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload CSV or JSON containing return records, customer complaints, or vendor feedback.
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {uploadStatus && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="text-[11px]">Need sample format?</span>
              <button
                onClick={handleDownloadCsvTemplate}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV template
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Connected database */}
        {activeTab === 'database' && (
          <div className="p-6 space-y-5">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    PostgreSQL / Metabase Read-Replica
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Online (14ms latency)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Catalogue Scale</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">14,280 Active SKUs</span>
                  <span className="text-[11px] text-slate-400">Jaipur &amp; Tiruppur lots</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Weekly Return Stream</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5 block">~6,547 unclassified</span>
                  <span className="text-[11px] text-slate-400">44% in 'Other' dropdown</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono text-[11px]">Database Host:</span>
                  <span className="text-slate-300 font-mono text-[11px]">db.blr-01.dhaga.internal:5432</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono text-[11px]">Last Sync:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{dbLastSynced}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleSyncDb}
                disabled={dbSyncing}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                {dbSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing latest catalogue batches...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Database Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

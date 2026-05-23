'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileText, FileSpreadsheet, FileArchive, File,
  CheckCircle2, AlertTriangle, Loader2, Ship, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type DocCategory = 'Clearance' | 'Manifest' | 'Certificate' | 'Permit' | 'Report' | 'Invoice' | 'Customs' | 'Other';
type DocStatus = 'Approved' | 'Pending' | 'Draft';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  done: boolean;
  error: string | null;
}

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (doc: any) => void;
}

const vessels = [
  'CMA CGM ALTAMIRA', 'MSC AURORA', 'MAERSK GUJARAT',
  'EVERGREEN LOTUS', 'COSCO PRIDE', 'EVERGREEN ACE',
];

const categories: DocCategory[] = [
  'Clearance', 'Manifest', 'Certificate', 'Permit',
  'Report', 'Invoice', 'Customs', 'Other',
];

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-400" />;
  if (['xlsx', 'xls', 'csv'].includes(ext ?? '')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
  if (['zip', 'rar'].includes(ext ?? '')) return <FileArchive className="w-5 h-5 text-amber-400" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDocumentModal({ open, onClose, onUploaded }: UploadDocumentModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState<DocCategory>('Other');
  const [vessel, setVessel] = useState('');
  const [refNo, setRefNo] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DocStatus>('Pending');
  const [sensitive, setSensitive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const entries: UploadedFile[] = Array.from(newFiles).map(f => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      done: false,
      error: null,
    }));
    setFiles(prev => [...prev, ...entries]);

    // Simulate upload progress per file
    entries.forEach(entry => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.floor(Math.random() * 18) + 8;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f => f.id === entry.id ? { ...f, progress: 100, done: true } : f)
          );
        } else {
          setFiles(prev =>
            prev.map(f => f.id === entry.id ? { ...f, progress: prog } : f)
          );
        }
      }, 150);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleSubmit = () => {
    if (files.length === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      files.forEach((f, i) => {
        const ext = f.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
        const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        onUploaded({
          id: `DOC-NEW-${Date.now()}-${i}`,
          title: f.file.name.replace(/\.[^/.]+$/, ''),
          type: ext,
          category,
          status,
          vessel: vessel || null,
          refNo: refNo || `REF-${Date.now()}`,
          issuedDate: now,
          expiryDate: null,
          uploadedBy: 'You',
          uploadDate: now,
          size: formatSize(f.file.size),
          pages: 0,
          sensitive,
          notes,
        });
      });
      setSubmitting(false);
      handleClose();
    }, 800);
  };

  const handleClose = () => {
    setFiles([]);
    setCategory('Other');
    setVessel('');
    setRefNo('');
    setNotes('');
    setStatus('Pending');
    setSensitive(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upload Document</h2>
              <p className="text-[11px] text-muted-foreground">Add files to the port document repository</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border/50 hover:border-primary/40 hover:bg-muted/20'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.xlsx,.xls,.csv,.zip,.rar,.docx,.png,.jpg"
              onChange={e => addFiles(e.target.files)}
            />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Drop files here or <span className="text-primary">browse</span></p>
            <p className="text-[11px] text-muted-foreground mt-1">PDF, XLSX, ZIP, DOCX, images up to 50MB each</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg px-3 py-2">
                  {fileIcon(f.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{f.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-border/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-200"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {f.done ? formatSize(f.file.size) : `${f.progress}%`}
                      </span>
                    </div>
                  </div>
                  {f.done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                  <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Category *</label>
              <Select value={category} onValueChange={v => setCategory(v as DocCategory)}>
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Status</label>
              <Select value={status} onValueChange={v => setStatus(v as DocStatus)}>
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['Pending', 'Approved', 'Draft'] as DocStatus[]).map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Vessel (optional)</label>
              <Select value={vessel} onValueChange={v => setVessel(v === '__none__' ? '' : v)}>
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-muted/30">
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="text-xs">None</SelectItem>
                  {vessels.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Reference No.</label>
              <input
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                placeholder="e.g. MFT-2026-0421"
                className="w-full h-8 px-2.5 text-xs bg-muted/30 border border-border/40 rounded-[8px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this document..."
              rows={2}
              className="w-full px-2.5 py-2 text-xs bg-muted/30 border border-border/40 rounded-[8px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none"
            />
          </div>

          {/* Confidential toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div
              onClick={() => setSensitive(!sensitive)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${sensitive ? 'bg-amber-500' : 'bg-muted/50 border border-border/50'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${sensitive ? 'left-4' : 'left-0.5'}`} />
            </div>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-foreground">Mark as Confidential</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/40 bg-muted/10">
          <Button variant="outline" size="sm" className="rounded-[8px] text-xs" onClick={handleClose}>Cancel</Button>
          <Button
            size="sm"
            className="rounded-[8px] text-xs bg-gradient-to-r from-sky-500 to-indigo-500 text-white gap-1.5"
            disabled={files.length === 0 || submitting || files.some(f => !f.done)}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
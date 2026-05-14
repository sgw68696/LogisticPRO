'use client';

import { useState } from 'react';
import { X, Folder, FolderPlus, Loader2, Lock, Ship, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface FolderItem {
  id: string;
  name: string;
  category: string;
  vessel: string | null;
  description: string;
  sensitive: boolean;
  color: string;
  docCount: number;
  createdAt: string;
}

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (folder: FolderItem) => void;
}

const FOLDER_COLORS = [
  { label: 'Blue', value: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
  { label: 'Emerald', value: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
  { label: 'Amber', value: 'bg-amber-500/20 border-amber-500/30 text-amber-400' },
  { label: 'Sky', value: 'bg-sky-500/20 border-sky-500/30 text-sky-400' },
  { label: 'Red', value: 'bg-red-500/20 border-red-500/30 text-red-400' },
  { label: 'Purple', value: 'bg-purple-500/20 border-purple-500/30 text-purple-400' },
];

const vessels = [
  'CMA CGM ALTAMIRA', 'MSC AURORA', 'MAERSK GUJARAT',
  'EVERGREEN LOTUS', 'COSCO PRIDE',
];

const categories = [
  'Clearance', 'Manifest', 'Certificate', 'Permit',
  'Report', 'Invoice', 'Customs', 'Other',
];

export function NewFolderModal({ open, onClose, onCreated }: NewFolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [vessel, setVessel] = useState('');
  const [sensitive, setSensitive] = useState(false);
  const [color, setColor] = useState(FOLDER_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) { setError('Folder name is required'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      onCreated({
        id: `FOLDER-${Date.now()}`,
        name: name.trim(),
        category: category || 'Other',
        vessel: vessel || null,
        description,
        sensitive,
        color,
        docCount: 0,
        createdAt: now,
      });
      setLoading(false);
      handleClose();
    }, 600);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('');
    setVessel('');
    setSensitive(false);
    setColor(FOLDER_COLORS[0].value);
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">New Folder</h2>
              <p className="text-[11px] text-muted-foreground">Organise documents into a named folder</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Folder name */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Folder Name *</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. CMA CGM ALTAMIRA - May 2026"
              autoFocus
              className={`w-full h-9 px-3 text-sm bg-muted/30 border rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-all ${
                error ? 'border-destructive/60 bg-destructive/5' : 'border-border/40 focus:border-primary/50 focus:bg-primary/5'
              }`}
            />
            {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-muted/30 border border-border/40 rounded-[9px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none"
            />
          </div>

          {/* Category + Vessel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-muted/30">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Vessel</label>
              <Select value={vessel} onValueChange={v => setVessel(v === '__none__' ? '' : v)}>
                <SelectTrigger className="h-8 text-xs rounded-[8px] bg-muted/30">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="text-xs">None</SelectItem>
                  {vessels.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Folder color picker */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-2 block">Folder Color</label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${c.value} ${
                    color === c.value ? 'scale-110 ring-2 ring-primary ring-offset-1 ring-offset-card' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Folder preview */}
          <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${color}`}>
            <Folder className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold">{name || 'Untitled Folder'}</p>
              <p className="text-[10px] opacity-70">{category || 'Other'} · 0 documents{sensitive ? ' · Confidential' : ''}</p>
            </div>
          </div>

          {/* Confidential toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setSensitive(!sensitive)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${sensitive ? 'bg-amber-500' : 'bg-muted/50 border border-border/50'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${sensitive ? 'left-4' : 'left-0.5'}`} />
            </div>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-foreground">Restricted access folder</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/40 bg-muted/10">
          <Button variant="outline" size="sm" className="rounded-[8px] text-xs" onClick={handleClose}>Cancel</Button>
          <Button
            size="sm"
            className="rounded-[8px] text-xs bg-gradient-to-r from-sky-500 to-indigo-500 text-white gap-1.5"
            disabled={!name.trim() || loading}
            onClick={handleCreate}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
            Create Folder
          </Button>
        </div>
      </div>
    </div>
  );
}
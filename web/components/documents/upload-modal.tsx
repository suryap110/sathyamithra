'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocType?: string;
}

const DOCUMENT_TYPES = [
  "Aadhaar",
  "PAN",
  "Income Certificate",
  "Caste Certificate",
  "Residence Certificate",
  "Community Certificate",
  "Birth Certificate",
  "Bank Passbook",
  "Marksheet",
  "Transfer Certificate",
  "Disability Certificate",
  "Land Documents",
  "Employment Certificate",
  "Ration Card",
  "Passport",
  "Other"
];

export function UploadModal({ isOpen, onClose, defaultDocType = 'Aadhaar' }: UploadModalProps) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(defaultDocType);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a file to upload.');
      
      const formData = new FormData();
      formData.append('document_type', selectedType);
      formData.append('file', file);

      const res = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness'] });
      setFile(null);
      setErrorMsg(null);
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || err.message || 'Upload failed');
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMsg('File size exceeds 10 MB limit.');
        return;
      }
      setFile(selected);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 10 * 1024 * 1024) {
        setErrorMsg('File size exceeds 10 MB limit.');
        return;
      }
      setFile(dropped);
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sathya-teal-50 text-sathya-teal-600 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sathya-indigo-900 text-base">Upload to Document Vault</h3>
              <p className="text-xs text-slate-500">Secure AES encrypted file storage abstraction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Document Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-sathya-teal-500"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-sathya-teal-500 bg-sathya-teal-50/50 scale-[0.99]'
              : file
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-sathya-teal-400 bg-slate-50/50'
          }`}
          onClick={() => document.getElementById('vault-file-input')?.click()}
        >
          <input
            id="vault-file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="space-y-2">
              <FileText className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <div className="text-xs font-bold text-slate-900">{file.name}</div>
              <div className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready to upload</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-sathya-teal-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Drag & Drop or <span className="text-sathya-teal-600 underline">Browse File</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supported formats: PDF, JPG, JPEG, PNG (Max 10 MB)
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="gap-2 px-6"
            disabled={!file || uploadMutation.isPending}
            isLoading={uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Button>
        </div>

      </div>
    </div>
  );
}

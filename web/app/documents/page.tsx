'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadModal } from '@/components/documents/upload-modal';
import { 
  FileText, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  Search,
  Plus
} from 'lucide-react';

export default function DocumentVaultPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['user-documents'],
    queryFn: async () => {
      const res = await apiClient.get('/documents');
      return res.data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      await apiClient.delete(`/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
    },
  });

  const totalDocs = documents.length;
  const expiringDocs = documents.filter((d: any) => d.is_expiring_soon || d.is_expired);
  const verifiedDocs = documents.filter((d: any) => d.verification_status === 'VERIFIED');

  const filteredDocs = documents.filter((d: any) => {
    const matchesFilter = filterType === 'All' || d.document_type === filterType;
    const matchesSearch = d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.document_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStreamFile = async (docId: string, fileName: string) => {
    try {
      const response = await apiClient.get(`/documents/${docId}/file`, { responseType: 'blob' });
      const contentType = String(response.headers['content-type'] || 'application/pdf');
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download or view document file.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-8 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sathya-saffron-500 backdrop-blur">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Citizen Document Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold">My Document Vault</h1>
          <p className="text-sm text-slate-200">
            Store and manage government certificates with AES encryption abstraction for automated scheme readiness.
          </p>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="gap-2 px-6 shadow-md shrink-0"
          onClick={() => setIsUploadOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2 border-sathya-teal-200 bg-sathya-teal-50/20">
          <div className="flex items-center justify-between text-xs font-semibold text-sathya-teal-800">
            <span>Documents Stored</span>
            <FileText className="w-4 h-4 text-sathya-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-sathya-indigo-900">{totalDocs} Available</div>
          <p className="text-xs text-slate-500">AES encrypted storage key abstraction</p>
        </Card>

        <Card className="p-6 space-y-2 border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Verified Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">{verifiedDocs.length} Verified</div>
          <p className="text-xs text-slate-500">Ready for direct scheme matching</p>
        </Card>

        <Card className="p-6 space-y-2 border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Expiring / Renewals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-950">{expiringDocs.length} Action Needed</div>
          <p className="text-xs text-slate-500">Expiring within 30 days or expired</p>
        </Card>
      </div>

      {/* Main Vault Workspace */}
      <div className="space-y-6">
        
        {/* Controls: Search + Document Type Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded documents..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-sathya-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {['All', 'Aadhaar', 'Income Certificate', 'Community Certificate', 'Marksheet', 'Bank Passbook'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterType === t
                    ? 'bg-sathya-indigo-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Empty Vault State */}
        {!isLoading && filteredDocs.length === 0 && (
          <Card className="p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-sathya-indigo-900">No documents found</h3>
              <p className="text-xs text-slate-500">Upload your government certificates to calculate application readiness.</p>
            </div>
            <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
              Upload First Document
            </Button>
          </Card>
        )}

        {/* Document Cards Grid */}
        {!isLoading && filteredDocs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc: any) => (
              <Card key={doc.id} className="p-5 space-y-4 hover:border-sathya-teal-400 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-sathya-teal-50 text-sathya-teal-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sathya-indigo-900 text-sm truncate max-w-[160px]">
                          {doc.document_type}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[160px]">
                          {doc.file_name}
                        </span>
                      </div>
                    </div>

                    <Badge variant={doc.is_expired ? 'accent' : 'primary'} className="text-[10px]">
                      {doc.verification_status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-semibold text-slate-700">{(doc.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="font-semibold text-slate-700">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    {doc.is_expiring_soon && (
                      <div className="p-2 bg-amber-50 text-amber-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Document expiring soon. Consider renewing.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => handleStreamFile(doc.id, doc.file_name)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </Button>

                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}

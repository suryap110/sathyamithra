'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApplicationTimeline } from '@/components/applications/application-timeline';
import { DocumentChecklist } from '@/components/documents/document-checklist';
import { 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  FileText,
  ShieldAlert,
  Edit,
  Building
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('SUBMITTED');
  const [refNoInput, setRefNoInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // Fetch Application Details
  const { data: appData, isLoading } = useQuery({
    queryKey: ['application-detail', appId],
    queryFn: async () => {
      const res = await apiClient.get(`/applications/${appId}`);
      return res.data;
    },
    enabled: !!appId && !!user,
  });

  // Fetch Scheme Document Readiness for this scheme
  const { data: readinessData } = useQuery({
    queryKey: ['document-readiness', appData?.scheme_id],
    queryFn: async () => {
      const res = await apiClient.post('/documents/readiness', { scheme_id: appData?.scheme_id });
      return res.data;
    },
    enabled: !!appData?.scheme_id && !!user,
  });

  // Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        status: newStatus,
        reference_number: refNoInput || appData?.reference_number,
        notes: noteInput || `Status manually updated to ${newStatus}`,
      };
      const res = await apiClient.post(`/applications/${appId}/status`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', appId] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      setIsUpdateOpen(false);
      setNoteInput('');
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-6">
        <div className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-sathya-indigo-900">Application Not Found</h2>
        <Link href="/applications">
          <Button variant="outline" size="sm">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const scheme = appData.scheme;
  const history = appData.status_history || [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link href="/applications" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sathya-indigo-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application Dashboard</span>
      </Link>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sathya-indigo-900 to-sathya-teal-800 p-8 rounded-2xl text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded text-sathya-saffron-500">
                Application Ref: {appData.reference_number || 'SM-2026-PENDING'}
              </span>
              <Badge variant="secondary">{appData.status.replace(/_/g, ' ')}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{scheme?.title || 'Scheme Application'}</h1>
            <p className="text-xs sm:text-sm text-slate-200">
              {scheme?.ministry || scheme?.state} • Mode: {scheme?.application_mode || 'Online'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="accent"
              size="md"
              className="gap-2 shadow-md"
              onClick={() => setIsUpdateOpen(true)}
            >
              <Edit className="w-4 h-4" />
              <span>Update Status</span>
            </Button>
          </div>
        </div>
      </div>

      {/* NON-FAKE TRACKING DISCLAIMER BOX */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Official Application Tracking Disclaimer:</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Application tracking is based on updates you provide. Sathyamithra does not have real-time access to the department's internal application processing system.
          </p>
        </div>
      </div>

      {/* Visual Application Timeline */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-base font-extrabold text-sathya-indigo-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sathya-teal-600" />
          <span>Application Status Timeline</span>
        </CardTitle>
        <ApplicationTimeline currentStatus={appData.status} statusHistory={history} />
      </Card>

      {/* Main Grid: Document Readiness Checklist + Scheme Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Document Readiness */}
        <div className="md:col-span-7 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-sathya-indigo-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sathya-teal-600" />
                <span>Required Documents Checklist</span>
              </CardTitle>
              <span className="text-xs font-bold text-sathya-teal-700 bg-sathya-teal-50 px-2.5 py-1 rounded-lg">
                {readinessData?.readiness_percentage || 0}% Ready
              </span>
            </div>

            <DocumentChecklist items={readinessData?.items || []} />
          </Card>
        </div>

        {/* Right Column: Official Portal Link & Notes */}
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6 space-y-4 border-sathya-teal-200 bg-sathya-teal-50/10">
            <CardTitle className="text-base font-bold text-sathya-indigo-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-sathya-teal-600" />
              <span>Official Department Portal</span>
            </CardTitle>

            <p className="text-xs text-slate-600 leading-relaxed">
              Complete your formal submission on the official ministry website.
            </p>

            <a
              href={appData.official_application_url || scheme?.official_url || 'https://myscheme.gov.in'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button variant="primary" size="md" className="w-full gap-2 justify-center shadow-md">
                <span>Continue to Official Application</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </Card>

          {/* Notes Card */}
          {appData.notes && (
            <Card className="p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant Notes</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{appData.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-sathya-indigo-900 text-lg">Update Application Status</h3>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs bg-white"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ADDITIONAL_INFORMATION_REQUIRED">Additional Information Required</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Official Reference / Acknowledgement ID</label>
              <input
                type="text"
                value={refNoInput}
                onChange={(e) => setRefNoInput(e.target.value)}
                placeholder="e.g. TN-SCH-2026-9921"
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Notes / Remarks</label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Submitted online portal form. Acknowledgment slip saved."
                className="w-full h-20 rounded-xl border border-slate-300 p-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate()}
              >
                Save Status Update
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

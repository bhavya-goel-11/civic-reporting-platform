'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportDetailModal from '@/components/report-detail-modal';
import { reportsApi } from '@/lib/supabase';

// Types for our data
type Report = {
  id: string;
  description: string;
  image_url?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  location: any; // jsonb field
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  user_id: string;
};

const statuses = ['All Status', 'pending', 'in_progress', 'resolved'];

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">Pending</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">In Progress</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Resolved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLocation(location: any) {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  if (location.address) return location.address;
  if (location.coordinates) {
    return `${location.coordinates.lat?.toFixed(4)}, ${location.coordinates.lng?.toFixed(4)}`;
  }
  return JSON.stringify(location);
}

interface ReportsPageProps {}

export default function ReportsPage({}: ReportsPageProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch reports from Supabase
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);

        // Check environment variables first
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('Environment check:', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING'
        });

        if (!supabaseUrl || !supabaseKey) {
          setError('Supabase configuration is missing. Please check your environment variables.');
          return;
        }

        console.log('Fetching reports...');
        const data = await reportsApi.getReports();
        console.log('Reports fetch successful:', data?.length || 0, 'reports found');
        setReports(data as Report[]);
      } catch (err) {
        console.error('Error fetching reports:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load reports: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // Filter reports based on search and filters
  const filteredReports = reports.filter((report) => {
    const searchableText = [
      report.description || '',
      report.id || '',
      JSON.stringify(report.location) || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-gray-600">Manage and track all civic reports</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-red-600 text-lg font-medium mb-2">Connection Error</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">
            Manage and track all civic reports
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'All Status' ? status : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All Status');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Reports ({loading ? '...' : filteredReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No reports found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow 
                        key={report.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedReport(report)}
                      >
                        <TableCell className="font-medium">#{report.id.slice(0, 8)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={report.description}>
                            {report.description}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={formatLocation(report.location)}>
                            {formatLocation(report.location)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-green-600">↑{report.upvotes || 0}</span>
                            <span className="text-red-600">↓{report.downvotes || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={async (reportId, status) => {
          try {
            await reportsApi.updateReportStatus(reportId, status);
            // Refresh reports data
            const updatedReports = await reportsApi.getReports();
            setReports(updatedReports as Report[]);
            
            // Update selected report if it's still the same one
            if (selectedReport && selectedReport.id === reportId) {
              const updatedReport = (updatedReports as Report[]).find(r => r.id === reportId);
              if (updatedReport) {
                setSelectedReport(updatedReport);
              }
            }
          } catch (error) {
            console.error('Error updating report status:', error);
            setError('Failed to update report status. Please try again.');
          }
        }}
      />
    </AdminLayout>
  );
}
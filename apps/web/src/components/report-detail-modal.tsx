'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationApi, showToast } from '@/lib/notifications';

interface Report {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  location: any; // jsonb field  
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  user_id: string;
  image_url?: string;
}

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (reportId: string, status: 'pending' | 'in_progress' | 'resolved') => void;
}

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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

export default function ReportDetailModal({
  report,
  isOpen,
  onClose,
  onUpdateStatus,
}: ReportDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'in_progress' | 'resolved'>(report?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!report) return null;

  const handleUpdateStatus = async () => {
    if (selectedStatus === report.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus?.(report.id, selectedStatus);
      showToast.success(`Status updated successfully`);
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewOnMap = () => {
    // This would integrate with a mapping service
    // For now, we'll just show a placeholder
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(report.location)}`;
    window.open(mapUrl, '_blank');
    showToast.info('Opening location in Google Maps');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Report Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report ID</label>
                <p className="text-lg font-mono">{report.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <div>{getStatusBadge(report.status)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{formatLocation(report.location)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{formatDate(report.created_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-900">{report.user_id.slice(0, 8)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Community Engagement</label>
                <div className="flex items-center space-x-4">
                  <span className="text-green-600">↑ {report.upvotes || 0} upvotes</span>
                  <span className="text-red-600">↓ {report.downvotes || 0} downvotes</span>
                </div>
              </div>
            </div>
            
            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <div className="border rounded-lg overflow-hidden">
                {report.image_url ? (
                  <img 
                    src={report.image_url} 
                    alt="Report photo"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No photo available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900">{report.description}</p>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrative Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Update Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={selectedStatus === report.status || isUpdating}
                  className="w-full mt-2"
                  size="sm"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
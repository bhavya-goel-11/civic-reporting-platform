// Notification API functions for communicating with the backend

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface NotificationPayload {
  reportId: string;
  userId: string;
  type: 'status_update' | 'assignment' | 'resolution';
  message: string;
  status?: 'pending' | 'in_progress' | 'resolved';
}

export const notificationApi = {
  // Send notification to citizen when report status changes
  async notifyStatusChange(reportId: string, userId: string, newStatus: string, message?: string) {
    try {
      const payload: NotificationPayload = {
        reportId,
        userId,
        type: 'status_update',
        status: newStatus as any,
        message: message || `Your report ${reportId} status has been updated to ${newStatus.replace('_', ' ')}`
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  },

  // Send notification when staff is assigned
  async notifyStaffAssignment(reportId: string, userId: string, staffName: string) {
    try {
      const payload: NotificationPayload = {
        reportId,
        userId,
        type: 'assignment',
        message: `Your report ${reportId} has been assigned to ${staffName} for resolution.`
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Assignment notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send assignment notification:', error);
      throw error;
    }
  },

  // Send notification when report is resolved
  async notifyResolution(reportId: string, userId: string, resolutionMessage?: string) {
    try {
      const payload: NotificationPayload = {
        reportId,
        userId,
        type: 'resolution',
        status: 'resolved',
        message: resolutionMessage || `Your report ${reportId} has been resolved. Thank you for helping improve our community!`
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resolution notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send resolution notification:', error);
      throw error;
    }
  },

  // Generic notification sender
  async sendCustomNotification(reportId: string, userId: string, message: string) {
    try {
      const payload: NotificationPayload = {
        reportId,
        userId,
        type: 'status_update',
        message
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Custom notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send custom notification:', error);
      throw error;
    }
  }
};

// Toast notification helpers for the admin interface
export const showToast = {
  success: (message: string) => {
    // This would integrate with a toast library like react-hot-toast
    console.log('SUCCESS:', message);
    // For now, just use browser alert (replace with proper toast in production)
    if (typeof window !== 'undefined') {
      // You could integrate with libraries like:
      // - react-hot-toast
      // - react-toastify
      // - or create a custom toast component
      alert(`✅ ${message}`);
    }
  },
  
  error: (message: string) => {
    console.error('ERROR:', message);
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },
  
  info: (message: string) => {
    console.log('INFO:', message);
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  }
};
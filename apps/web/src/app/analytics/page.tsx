'use client'
import AdminLayout from '@/components/admin-layout';
import RequireAdmin from '@/components/require-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">
              Insights and trends for civic reporting (Coming Soon)
            </p>
          </div>

          {/* Placeholder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Future Analytics Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">The analytics dashboard will include:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Report volume trends over time</li>
                  <li>Average resolution times by category</li>
                  <li>Staff performance metrics</li>
                  <li>Geographic heat maps of report locations</li>
                  <li>Citizen satisfaction ratings</li>
                  <li>Seasonal patterns and forecasting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RequireAdmin>
  );
}
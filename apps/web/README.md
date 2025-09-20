# Civic Reporting Admin Portal

An admin portal MVP for managing civic reports and infrastructure issues. Built with Next.js, Tailwind CSS, and shadcn/ui components, matching the design theme of the mobile app.

## Features

### 🏠 Dashboard
- Summary cards showing total reports, open reports, in progress, and resolved
- Interactive map placeholder for report locations
- Recent reports table with quick status overview

### 📋 Reports Management
- Comprehensive reports table with filtering by status, category, and date
- Search functionality across report descriptions, IDs, and locations
- Detailed report view modal with photo display
- Status updates (Pending, In Progress, Resolved)
- Staff assignment functionality
- Internal notes system

### 📊 Analytics (Coming Soon)
- Placeholder for future analytics features
- Report trends and performance metrics
- Response time analysis

### 🔔 Notifications
- Automatic citizen notifications on status changes
- Staff assignment notifications
- Custom notification sending
- Integration with backend notification system

### 🎨 Design & UX
- Responsive mobile-first design
- Amber color theme matching mobile app
- Clean, consistent shadcn/ui components
- Intuitive sidebar navigation

## Tech Stack

- **Frontend**: Next.js 15.5.3, React 19
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase integration ready
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard page
│   │   ├── reports/            # Reports management
│   │   ├── analytics/          # Analytics (placeholder)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home redirect
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── admin-layout.tsx    # Main admin layout
│   │   └── report-detail-modal.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client & API
│   │   ├── notifications.ts    # Notification helpers
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── supabase.ts         # Database types
├── package.json
├── tsconfig.json
├── .env.example                # Environment variables template
└── README.md
```

## Setup Instructions

### 1. Environment Variables

Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001  # Optional: for notifications
```

### 2. Install Dependencies

```bash
npm install
```

Note: If you encounter PowerShell execution policy issues on Windows, you may need to manually install the dependencies or adjust your execution policy.

### 3. Database Setup

The app expects the following Supabase table structure:

#### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'resolved')) DEFAULT 'pending',
  category TEXT,
  location JSONB, -- {lat: number, lng: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  assigned_staff_id UUID REFERENCES users(id),
  internal_notes TEXT
);
```

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('citizen', 'staff', 'admin')) DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Navigation
- **Dashboard**: Overview of all reports and system status
- **Reports**: Detailed report management with filtering and actions
- **Analytics**: Future analytics features (placeholder)

### Managing Reports
1. Go to Reports page
2. Use filters to find specific reports by status, category, or search terms
3. Click on any report row to open detailed view
4. In the detail modal:
   - Update report status
   - Assign staff members
   - Add internal notes
   - Send notifications to citizens
   - View location on map

### Notifications
The system automatically sends notifications to citizens when:
- Report status is updated
- Staff is assigned to their report
- Report is marked as resolved

Custom notifications can also be sent manually.

## Development Notes

### Current Status
- ✅ Basic UI components and layout
- ✅ Mock data for development
- ✅ Report filtering and search
- ✅ Status update functionality
- ✅ Staff assignment system
- ✅ Notification system integration
- 🔄 Supabase integration (configured but not connected)
- ⏳ Real data fetching
- ⏳ Authentication system
- ⏳ File upload for photos
- ⏳ Map integration

### Supabase Integration
The Supabase client is configured and ready to use. To connect:
1. Set up your Supabase project
2. Configure environment variables
3. Replace mock data with actual API calls
4. Update the `reportsApi` and `usersApi` functions in `src/lib/supabase.ts`

### Styling
The admin portal uses the same amber color theme as the mobile app:
- Primary: Amber-800 (#92400E)
- Accent: Amber-100 (#FEF3C7)
- Status colors: Yellow (pending), Blue (in progress), Green (resolved)

### Type Safety
All components use TypeScript with proper type definitions for Supabase tables and API responses.

## Future Enhancements

- [ ] Real-time updates with Supabase subscriptions
- [ ] Photo upload and management
- [ ] Interactive map with report markers
- [ ] Advanced analytics dashboard
- [ ] User authentication and role-based access
- [ ] Export functionality
- [ ] Mobile responsiveness improvements
- [ ] Dark mode support
- [ ] Batch operations for reports

## Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new code
3. Test on both desktop and mobile viewports
4. Maintain the amber theme consistency
5. Add proper error handling and loading states

## License

This project is part of the Civic Reporting Platform.

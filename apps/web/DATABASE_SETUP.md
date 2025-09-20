# Database Setup Guide - Updated for Your Schema

This admin portal works with your existing database structure:

## Current Schema Analysis

Based on your test results, you have:
- ✅ **Supabase Auth** for user management (not a custom users table)
- ✅ **Reports table** exists but missing `title` column
- ❌ **No users table** (using Supabase auth instead)

## Required Schema Updates

### 1. Reports Table Structure
Your reports table should have these columns:
```sql
-- Check current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reports';

-- If you need to add missing columns:
ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS assigned_staff_id UUID;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add status constraint if needed
ALTER TABLE reports ADD CONSTRAINT IF NOT EXISTS status_check 
  CHECK (status IN ('pending', 'in_progress', 'resolved'));
```

### 2. Row Level Security (RLS)
```sql
-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Reports are viewable by everyone" ON reports 
  FOR SELECT USING (true);

CREATE POLICY "Reports are updatable by everyone" ON reports 
  FOR UPDATE USING (true);
```

### 3. Sample Data (Optional)
```sql
-- Insert sample reports for testing
INSERT INTO reports (description, status, category, location, user_id) VALUES
  ('Large pothole causing vehicle damage on Main Street', 'pending', 'Road Maintenance', 'Main St & 1st Ave', gen_random_uuid()),
  ('Street light not working at night', 'in_progress', 'Street Lighting', 'Oak Avenue', gen_random_uuid()),
  ('Graffiti on building wall', 'resolved', 'Vandalism', 'Downtown Plaza', gen_random_uuid()),
  ('Overflowing trash bin attracting pests', 'pending', 'Waste Management', 'Central Park', gen_random_uuid()),
  ('Damaged sidewalk creates tripping hazard', 'in_progress', 'Sidewalk Repair', 'Elm Street', gen_random_uuid());
```

## Key Changes Made to Admin Portal

### 1. **Removed Title Field**
- Updated all components to use only `description`
- Removed references to `report.title`

### 2. **Removed Users Table Dependencies**
- No more joins to users table
- Staff assignment shows staff ID instead of names
- Using Supabase auth for user management

### 3. **Simplified Data Structure**
```typescript
type Report = {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  category: string;
  location: string;
  created_at: string;
  assigned_staff_id?: string;
  image_url?: string;
  internal_notes?: string;
  user_id?: string;
};
```

## Testing Your Setup

1. **Use the Database Test Page**: Visit `/test-db` in your admin portal
2. **Run the Test Script**: `node test-connection.js`
3. **Check Console Logs**: Look for detailed error messages

## Expected Working Features

✅ **Dashboard**: Shows real statistics and recent reports  
✅ **Reports List**: Displays all reports with filtering  
✅ **Report Details**: View individual report information  
✅ **Status Updates**: Change report status  
✅ **Staff Assignment**: Assign staff by ID  
✅ **Internal Notes**: Add administrative notes  

## Troubleshooting

**If you get "column does not exist" errors:**
- Run the ALTER TABLE statements above to add missing columns

**If you get permission errors:**
- Check your RLS policies
- Ensure your anon key has the right permissions

**If data doesn't appear:**
- Add sample data using the INSERT statements above
- Check that your reports table has data

Your admin portal should now work with your existing database structure!
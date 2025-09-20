## Tasks Accomplished
- **Task 1:** Designed and implemented a mobile app for citizens to report civic issues with photos, descriptions, and location.
- **Task 2:** Built a secure web admin dashboard for authorities to manage, track, and analyze reports.
- **Task 3:** Integrated Supabase authentication and storage, with Row Level Security (RLS) for user data protection.
- **Task 4:** Added interactive map visualization (Leaflet) for report locations in the admin dashboard.
- **Task 5:** Enabled upvote/downvote and search features for reported issues in the mobile app.

---

## Technology Stack
This project leverages the following technologies:

- **Expo/React Native:** Chosen for rapid cross-platform mobile development and easy device testing; used for the citizen-facing mobile app.
- **Next.js:** Used for the web admin dashboard due to its fast development, file-based routing, and React 19 support.
- **Supabase:** Provides authentication, database, and storage; selected for its developer-friendly interface and built-in RLS.
- **Leaflet & react-leaflet:** Used for interactive map rendering in the web dashboard; chosen for flexibility and open-source mapping.
- **Node.js/Express:** Powers the backend API (if needed for custom endpoints); selected for scalability and JavaScript ecosystem.
- **Tailwind CSS:** Enables rapid UI styling in the web app with utility-first classes.

---

## Key Features
- **Report Submission:** Citizens can submit civic issues with photos, descriptions, and geolocation from the mobile app.
- **Admin Dashboard:** Authorities access a secure dashboard to view, moderate, and analyze reports.
- **Interactive Map:** Visualizes report locations with custom markers and heatmaps for quick insights.
- **Authentication & RLS:** All data access is protected by Supabase authentication and Row Level Security policies.
- **Upvote/Downvote & Search:** Users can upvote/downvote issues and search for reports in the mobile app.

---

## Local Setup Instructions
Follow these steps to run the project locally (Windows & macOS):

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (create at https://supabase.com)

### 1. Clone the Repository
```sh
git clone https://github.com/bhavya-goel-11/civic-reporting-platform.git
cd civic-reporting-platform
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Setup Supabase Credentials
- Create a `.env` file in `apps/mobile` and (optionally) `apps/web`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Run the Mobile App
#### Windows:
```sh
cd apps/mobile
npm start
# or
expo start
```
#### macOS:
```sh
cd apps/mobile
npm start
# or
expo start
```
Scan the QR code with Expo Go or run on an emulator.

### 5. Run the Web Admin App
#### Windows & macOS:
```sh
cd apps/web
npm run dev
```
Access the dashboard at [http://localhost:3000](http://localhost:3000)

### 6. Supabase Setup
- Create tables and storage bucket in Supabase:
   - `reports` table: stores report data (id, description, image_url, status, location, user_id, etc.)
   - Enable Row Level Security (RLS) and add policies for authenticated users.
   - Create a storage bucket (e.g., `report-images`) for uploaded images and set RLS policies.
- See `apps/mobile/supabase/init.sql` and `apps/mobile/supabase/security.sql` for schema and policy examples.

### 7. Running Both Apps Together
- Use two terminals:
   - One for `npm run dev` in `apps/web` (web admin dashboard)
   - One for `npm start` in `apps/mobile` (mobile app)
- Both apps use Supabase for authentication and data.

---

## Troubleshooting
- **RLS errors:** Ensure Supabase policies allow authenticated users to insert/select/update/delete their own data.
- **Storage upload errors:** Add RLS policy for storage bucket to allow authenticated uploads.
- **Map markers not visible:** Check report data for valid location fields (`lat`, `lng`).
- **Authentication issues:** Verify Supabase credentials and user roles.

---

## License
This project is for SIH 2025 and educational purposes.

---

## Contact
For questions or collaboration, reach out to any team member or open an issue on GitHub.

# Copilot Instructions for AI Agents

## Project Overview
- **Monorepo** with three main apps:
  - `apps/web`: Next.js 15 app (React 19, Turbopack, Tailwind, TypeScript)
  - `apps/mobile`: Expo/React Native app (file-based routing, Supabase integration)
  - `apps/backend`: Node.js/Express API (Mongoose/MongoDB, CORS, dotenv)
- Shared dependencies managed via npm workspaces in the root `package.json`.

## Key Workflows
- **Web app**: `npm run dev` (from `apps/web`) or use workspace script from root.
- **Mobile app**: `npm run start` (from `apps/mobile`) or use root scripts like `npm run mobile:start`.
- **Backend**: Run `node index.js` in `apps/backend` (no custom scripts).
- **Reset mobile project**: `npm run reset-project` in `apps/mobile` (see `scripts/reset-project.js`).

## Patterns & Conventions
- **File-based routing**: Both web (`apps/web/src/app/`) and mobile (`apps/mobile/app/`) use directory-based routing.
- **TypeScript**: Used throughout, with strict configs in each app.
- **Component structure**: UI components in `apps/mobile/components/ui/` and `apps/web/src/app/components/`.
- **Supabase**: Used for backend integration in mobile (`apps/mobile/lib/supabase.ts`, `apps/mobile/types/supabase.ts`).
- **Theming**: Mobile uses custom hooks in `apps/mobile/hooks/` and constants in `apps/mobile/constants/`.

## Integration Points
- **Supabase**: Mobile app uses Supabase for authentication and data (see `lib/supabase.ts`).
- **Backend**: Express API with MongoDB (see `apps/backend/index.js`).
- **Web/Mobile separation**: No direct code sharing, but similar patterns for routing and state.

## Notable Files & Directories
- `apps/web/README.md`, `apps/mobile/README.md`: App-specific setup and workflow details.
- `apps/mobile/scripts/reset-project.js`: Resets mobile app to a blank state.
- `apps/mobile/lib/`, `apps/mobile/types/`: Supabase and type definitions.
- `apps/mobile/components/`, `apps/web/src/app/components/`: UI components.
- `apps/backend/index.js`: Express server entry point.

## Tips for AI Agents
- Always check the relevant app's README for up-to-date workflow instructions.
- Use workspace scripts from the root for consistent multi-app development.
- Follow the file/directory structure for routing and component placement.
- For new integrations, mirror existing patterns (e.g., Supabase usage in mobile).
- Avoid generic advice; focus on the conventions and workflows actually used here.

# 🎨 GR3 Frontend Directory Structure

A comprehensive guide to the React + Vite frontend application architecture for the GR3 Digital Library platform.

## 📂 Root Directory Structure

```
FE/
├── components.json                # shadcn-ui component configuration
├── eslint.config.js              # ESLint linter configuration
├── index.html                    # HTML entry point for Vite
├── jsconfig.json                 # JavaScript path aliases configuration
├── package.json                  # Dependencies and npm scripts
├── package-lock.json             # Dependency lock file
├── postcss.config.js             # PostCSS configuration for Tailwind
├── README.md                      # Frontend project documentation
├── STRUCTURE.md                   # This file - directory structure guide
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.js                # Vite build tool configuration
├── .gitignore                    # Git ignore rules
├── public/                        # Static assets (served as-is)
│   └── videos/                   # Video files
├── dist/                          # Production build output (generated)
└── src/                           # Source code directory
```

---

## 🔧 Configuration Files Explained

### Build & Development
- **`vite.config.js`**: Vite bundler configuration with:
  - React plugin setup
  - Dev server configuration
  - API proxy to backend (http://localhost:5000)
  - Build optimization settings

- **`package.json`**: Project metadata and npm scripts:
  - `dev`: Start development server (Vite with HMR)
  - `build`: Create optimized production build
  - `preview`: Preview production build locally
  - Dependencies: React 19, Redux, Tailwind, Axios, etc.

- **`jsconfig.json`**: JavaScript path aliases for clean imports:
  - `@/components` → `src/components`
  - `@/pages` → `src/pages`
  - `@/service` → `src/service`
  - `@/store` → `src/store`
  - `@/config` → `src/config`
  - `@/lib` → `src/lib`
  - `@/hooks` → `src/hooks`

### Styling & UI
- **`tailwind.config.js`**: Tailwind CSS 4.0 configuration:
  - Custom color palette and themes
  - Dark mode settings
  - Component customizations

- **`postcss.config.js`**: CSS post-processor configuration:
  - Tailwind CSS plugin integration
  - Autoprefixer for browser compatibility

- **`components.json`**: shadcn-ui configuration:
  - Component aliases
  - UI component library settings

### Code Quality
- **`eslint.config.js`**: ESLint configuration:
  - React hooks rules
  - Best practice checks
  - Code style enforcement

---

## 📁 Source Directory (`src/`)

### Entry Points

- **`main.jsx`**: React application entry point
  - Renders root App component
  - Mounts Redux store
  - Initialize i18n (internationalization)

- **`App.jsx`**: Root React component
  - Main app layout
  - Global route configuration (React Router)
  - Redux store provider setup
  - Theme context provider

- **`App.css`**: Global app styles
  - Layout-specific styles
  - App-wide CSS variables

- **`index.css`**: Global application styles
  - Base styles and resets
  - Typography defaults
  - Tailwind CSS directives

---

## 🧩 Components Directory (`src/components/`)

Reusable UI components organized by feature and type.

### Root Level Components (Generic/Shared)

| Component | Purpose |
|-----------|---------|
| `HeaderBar.jsx` | Main navigation header with search and user menu |
| `Account-sidebar.jsx` | User account sidebar (profile, settings, logout) |
| `IntroHero.jsx` | Landing page hero section |
| `BookCard.jsx` | Reusable book card component (used in listings) |
| `BookSection.jsx` | Section of books with title (used in home page) |
| `ListSection.jsx` | Generic list section wrapper component |
| `Search.jsx` | Search input component with auto-complete |
| `GlobalProgressTracker.jsx` | Reading progress tracker (context-based) |
| `CommentMenu.jsx` | Dropdown menu for comment actions |
| `Review-dialog.jsx` | Modal dialog for writing/editing reviews |
| `Review-section.jsx` | Display section for user reviews |
| `AudioPlayer.jsx` | Audio player for book narrations |
| `ComicReader.jsx` | Comic/manga reading interface |

### Admin Components (`components/admin/`)

Admin-specific components for dashboard and management:

| Component | Purpose |
|-----------|---------|
| `AdminLayout.jsx` | Layout wrapper for all admin pages |
| `Pagination.jsx` | Pagination controls for data tables |
| `RequireAdmin.jsx` | Auth guard component (admin-only access) |

### Authentication Components (`components/auth/`)

User authentication forms and flows:

| Component | Purpose |
|-----------|---------|
| `LoginForm.jsx` | User login form with validation |
| `RegisterForm.jsx` | User registration/signup form |

### Transaction Components (`components/transaction/`)

Payment and subscription related UI:

| Component | Purpose |
|-----------|---------|
| `TransactionCard.jsx` | Display single transaction details |
| `TransactionFilter.jsx` | Filters for transaction history |
| `TransactionStats.jsx` | Transaction statistics and summaries |

### UI Component Library (`components/ui/`)

shadcn-ui based reusable UI components (primitive building blocks):

| Component | Purpose |
|-----------|---------|
| `badge.jsx` | Badge/tag component |
| `button.jsx` | Reusable button with variants |
| `card.jsx` | Card container component |
| `dialog.jsx` | Modal dialog component |
| `dropdown-menu.jsx` | Dropdown menu component |
| `input.jsx` | Text input component |
| `label.jsx` | Form label component |
| `pdf-viewer.jsx` | PDF file viewer (react-pdf) |
| `select.jsx` | Dropdown select component |
| `switch.jsx` | Toggle switch component |
| `tabs.jsx` | Tabbed interface component |
| `textarea.jsx` | Multi-line text input |

### Chatbot Components (`components/Chatbot/`)

AI chatbot integration:

| Component | Purpose |
|-----------|---------|
| `Chatbot.jsx` | Main chatbot interface and conversation handler |

---

## 📄 Pages Directory (`src/pages/`)

Full-page components representing application routes.

### Main Pages

| Page | Route | Purpose |
|------|-------|---------|
| `HomePage.jsx` | `/` | Main landing/home page with book discoveries |
| `SearchPage.jsx` | `/search` | Book search results page |
| `Read.jsx` | `/book/:id` | Book reading interface with chapters |
| `BookShelf.jsx` | `/bookshelf` | User's personal book collections |
| `Profile.jsx` | `/profile` | User profile and account settings |
| `Membership.jsx` | `/membership` | Subscription/membership information |
| `Transactions.jsx` | `/transactions` | Payment history and transaction details |
| `Login.jsx` | `/login` | User login page |
| `Register.jsx` | `/register` | User registration/signup page |

### Admin Pages (`pages/admin/`)

Admin dashboard and management pages (requires admin role):

| Page | Route | Purpose |
|------|-------|---------|
| `Dashboard.jsx` | `/admin` | Admin overview and statistics |
| `Users.jsx` | `/admin/users` | User management and moderation |
| `Books.jsx` | `/admin/books` | Book catalog management (CRUD) |
| `Authors.jsx` | `/admin/authors` | Author management |
| `Subjects.jsx` | `/admin/subjects` | Book categories/subjects management |
| `Bookshelves.jsx` | `/admin/bookshelves` | User bookshelves management |
| `CommentsModeration.jsx` | `/admin/comments` | Review/comment moderation |
| `BookAnalytics.jsx` | `/admin/analytics` | Book-related analytics and reports |
| `Registrations.jsx` | `/admin/registrations` | User registration history |
| `Settings.jsx` | `/admin/settings` | Admin platform settings |

---

## 🔌 Services Directory (`src/service/`)

API integration and business logic services (API client layer).

### Authentication & User Services

| Service | Purpose |
|---------|---------|
| `AuthService.jsx` | Login, register, token refresh, logout |
| `UserService.jsx` | User profile, settings, account management |
| `HttpClient.jsx` | Axios instance with interceptors |
| `HttpHelper.jsx` | HTTP utility functions and helpers |

### Admin Services

| Service | Purpose |
|---------|---------|
| `AdminUserService.jsx` | User management API calls |
| `AdminBookService.jsx` | Book CRUD operations |
| `AdminAuthorService.jsx` | Author management API calls |
| `AdminSubjectService.jsx` | Subject/category management |
| `AdminStatsService.jsx` | Analytics and statistics API calls |
| `AdminChapterService.js` | Chapter management for books |
| `AdminSubscriptionService.js` | Subscription management |
| `BookshelfAdminService.jsx` | Admin bookshelf operations |

### Feature Services

| Service | Purpose |
|---------|---------|
| `PaymentService.jsx` | Payment processing and VNPay integration |
| `reduxHelper.jsx` | Redux state management utilities |

---

## 🏪 Store Directory (`src/store/`)

Redux state management configuration and slices.

### Store Configuration

| File | Purpose |
|------|---------|
| `configureStore.jsx` | Redux store setup with middleware |
| `index.js` | Store export and initialization |
| `reducers.js` | Reducer composition and root reducer |
| `epics.js` | Redux-Observable epics (async actions) |

### Auth State Management (`store/Auth/`)

User authentication state (Redux):

| File | Purpose |
|------|---------|
| `authSlice.jsx` | Redux slice for auth state (actions + reducers) |
| `authEpic.js` | Redux-Observable epic for async auth operations |
| `authSelector.js` | Reusable selectors for auth state queries |
| `index.js` | Auth store module exports |

### User State Management (`store/User/`)

User profile and account state (Redux):

| File | Purpose |
|------|---------|
| `UserSlice.jsx` | Redux slice for user profile data |
| `UserThunk.jsx` | Redux Thunk for async user operations |

---

## ⚙️ Config Directory (`src/config/`)

Application configuration and settings.

| File | Purpose |
|------|---------|
| `Axios-config.jsx` | Axios HTTP client configuration with: |
| | - Base URL pointing to backend |
| | - Default headers |
| | - Interceptors for token refresh |
| | - Error handling |

---

## 🪝 Hooks Directory (`src/hooks/`)

Custom React hooks for reusable logic (if present).

**Note**: Hook directory exists but specific files not documented in current structure.

---

## 📚 Contexts Directory (`src/contexts/`)

React Context API for global state (non-Redux).

| Context | Purpose |
|---------|---------|
| `ProgressContext.jsx` | Reading progress tracking context |
| | - Current chapter position |
| | - Reading statistics |
| | - Page position tracking |

---

## 🛠️ Lib Directory (`src/lib/`)

Utility functions and helper libraries.

| File | Purpose |
|------|---------|
| `utils.js` | General utility functions: |
| | - String formatting |
| | - Date utilities |
| | - Number formatting |
| | - Array/object helpers |

---

## 🖼️ Assets Directory (`src/assets/`)

Static assets and media files.

Typically includes:
- Icons (SVG, PNG)
- Images (logos, backgrounds, illustrations)
- Fonts
- Audio files
- Video clips

---

## 📜 I18n Directory (`src/translations/`)

Internationalization (multi-language) files.

Typically includes language JSON files:
- `en.json` - English translations
- `vi.json` - Vietnamese translations
- Other language files

Each file contains key-value pairs for UI text strings used throughout the application.

---

## 🎯 Component Organization Principles

### 1. **By Feature Type**
   - **UI Components** (`ui/`): Primitive, reusable components
   - **Feature Components** (root level): Feature-specific components (BookCard, Search, etc.)
   - **Auth Components** (`auth/`): Authentication-related components
   - **Admin Components** (`admin/`): Admin-only components

### 2. **File Naming**
   - PascalCase for component files: `HeaderBar.jsx`, `LoginForm.jsx`
   - kebab-case for utility files: `axios-config.jsx`
   - Index files optional, explicit imports preferred

### 3. **Component Structure**
   ```jsx
   // Standard component pattern
   import React from 'react';
   import { useSelector, useDispatch } from 'react-redux';
   
   export const ComponentName = ({ props }) => {
     // hooks
     // state
     // effects
     // handlers
     // render
   };
   ```

### 4. **Service Layer Pattern**
   - Services act as API client layer
   - All HTTP calls go through services
   - Services called from Redux actions/epics
   - Components dispatch actions, not call services directly

---

## 🔄 Data Flow Architecture

```
User Interaction
    ↓
Component Event Handler
    ↓
Dispatch Redux Action/Thunk/Epic
    ↓
Service (API call to backend)
    ↓
Redux State Update
    ↓
Component Re-render with new state
```

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Create Page** in `pages/`
2. **Create Components** in `components/`
3. **Create Service** in `service/` for API calls
4. **Create Redux Slice** in `store/` if state needed
5. **Add Route** in `App.jsx`
6. **Create Tests** (if testing framework configured)

### Adding a New Component

1. Determine component type (UI, feature, auth, admin)
2. Create file in appropriate `components/` subdirectory
3. Export component properly
4. Document props with JSDoc comments
5. Use UI components from `components/ui/` for styling

### Adding New Pages

1. Create file in `pages/` or `pages/admin/`
2. Add route in `App.jsx`
3. Create corresponding service if needed
4. Add to navigation menu

---

## 📊 State Management Strategy

### Redux Slices (for global state)
- **Auth**: Authentication state, user token, login status
- **User**: User profile information
- Custom slices as needed

### Local Component State (useState)
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary UI states

### Context API (react)
- Reading progress
- Theme/dark mode

### Service Layer
- All API communication
- Request/response transformation
- Error handling

---

## 🔐 Authentication Flow

1. User logs in via `LoginForm.jsx`
2. Form calls `AuthService.login()`
3. Backend returns JWT token
4. Token stored in Redux auth slice
5. Token auto-attached to all API requests via Axios interceptor
6. On token expiry, Axios interceptor triggers refresh
7. Refresh token exchanges for new access token

---

## 🎨 Styling Approach

- **Tailwind CSS**: Utility-first framework for styling
- **shadcn-ui**: Pre-built accessible components
- **Global Styles**: `App.css` and `index.css`
- **Component Styles**: Inline Tailwind classes
- **Dark Mode**: Handled via Tailwind dark: variant

---

## 🧪 Testing Structure (if configured)

```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── store/
```

---

## 📈 Performance Considerations

- **Code Splitting**: Vite automatically splits route bundles
- **Lazy Loading**: React.lazy() for page components
- **Image Optimization**: Use next-gen formats with Vite
- **Redux Selectors**: Memoized selectors prevent unnecessary re-renders
- **Pagination**: Implement for large lists (already in Pagination.jsx)

---

## 🔗 Important Links

- [React Documentation](https://react.dev)
- [Redux Documentation](https://redux.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn-ui Documentation](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

---

**Last Updated**: May 24, 2026

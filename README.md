# 📚 GR3 - Digital Library & Book Management Platform

A comprehensive, production-ready full-stack digital library platform combining modern web technologies, AI-powered recommendations, social features, and payment integration. GR3 provides a complete ecosystem for readers to discover, organize, and engage with books through an intuitive, feature-rich interface.

**Live Site**: [thuviensach.io.vn](https://thuviensach.io.vn/)

---

## 🎯 Project Overview

GR3 is a modern digital library platform designed for readers, library managers, and administrators. It offers a seamless experience for discovering books, managing personal collections, participating in a reading community, and accessing premium content through a subscription-based model.

### Core Vision
Modernize the way people discover and interact with books through cutting-edge technology, intelligent AI recommendations, and vibrant community features.

---

## ✨ Key Features

### User Experience
- **📖 Book Discovery & Reading**: Browse extensive catalog with detailed metadata, chapters, and inline reading interface
- **🔐 Secure Authentication**: JWT-based auth with role-based access control (Admin, User, Guest)
- **👥 Social Engagement**: Comment threads, reactions, user ratings, and community discussions
- **📚 Personal Bookshelves**: Create custom collections with tags, annotations, and reading progress
- **🔖 Reading Tools**: Chapter bookmarks, notes, reading progress tracking, and offline support

### Smart Features  
- **🤖 AI Recommendations**: Collaborative filtering (cosine similarity) for personalized book suggestions
- **💬 AI Chatbot**: Google GenAI-powered assistant for book queries and user support
- **📊 Analytics Dashboard**: User reading stats, popular books, community insights
- **💳 Payment Integration**: VNPay gateway for subscriptions and premium membership tiers

### Administration
- **👨‍💼 Admin Dashboard**: Manage users, books, authors, subjects, comments, and platform statistics
- **🛡️ Content Moderation**: Review and manage user comments and community content
- **📈 Platform Analytics**: Monitor user engagement, subscription metrics, and system health

---

## 🛠️ Technology Stack

### Frontend Architecture
```
React 19 + Vite 7 (Bundle-agnostic fast build)
    ↓
Redux Toolkit + Redux-Observable (State management & async)
    ↓
React Router 7 (Client-side routing)
    ↓
Tailwind CSS 4 + shadcn-ui (Component styling)
```

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.1.1 | UI library with hooks |
| **Bundler** | Vite | 7.1.7 | Fast development & production builds |
| **State** | Redux Toolkit | 2.11.0 | Predictable state container |
| **Async** | Redux-Observable | 2.2.0 | Epic middleware with RxJS |
| **Routing** | React Router | 7.9.6 | Client-side navigation |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework |
| **UI Library** | shadcn/ui | Latest | Pre-built accessible components |
| **HTTP Client** | Axios | 1.13.2 | Promise-based HTTP requests |
| **i18n** | i18next | Latest | Multi-language support (EN, VI) |
| **Visualization** | Recharts | Latest | Charts & analytics UI |
| **Animations** | GSAP + Swiper | Latest | Smooth animations & carousels |
| **Notifications** | react-toastify, Sonner | Latest | Toast notifications |
| **Markdown** | react-markdown + remark-gfm | Latest | Render GitHub-flavored markdown |
| **Linting** | ESLint | Latest | Code quality & standards |

### Backend Architecture
```
Node.js + Express.js (REST API server)
    ↓
Sequelize ORM (Database abstraction)
    ↓
PostgreSQL 16 (Relational data store)
    ↓
External Services (AI, Payments, CDN)
```

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript server runtime |
| **Framework** | Express.js | 5.1.0 | Minimalist web framework |
| **Database** | PostgreSQL | 16 (Alpine) | ACID-compliant relational DB |
| **ORM** | Sequelize | 6.37.7 | Object-relational mapping |
| **Auth** | JWT + bcrypt | 9.0.2, 5.1.1 | Token auth & password hashing |
| **Validation** | express-validator | 7.3.1 | Request schema validation |
| **Task Scheduler** | node-cron | 4.2.1 | Recurring job scheduler |
| **API Calls** | Axios | Latest | HTTP client for external services |
| **Middleware** | Cookie-parser, CORS | Latest | Request processing |
| **Dev Tool** | Nodemon | Latest | Auto-restart on file changes |

### AI/ML Pipeline
```
Python + Scikit-learn (Recommendation engine)
    ↓
Collaborative Filtering (Cosine Similarity)
    ↓
JSON Recommendation Model
    ↓
Backend Integration
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Language** | Python 3 | ML/Data processing |
| **Data Processing** | Pandas, NumPy | Data manipulation & analysis |
| **ML Algorithm** | Scikit-learn | Cosine similarity calculations |
| **Database** | SQLAlchemy + PostgreSQL Driver | Direct data access |
| **Output Format** | JSON | Model serialization for backend |

**Algorithm Details**:
- Builds user-item rating matrix from database
- Calculates cosine similarity between books
- Generates top-5 recommendations per book
- Runs periodically to keep recommendations fresh

### Containerization & Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container Runtime** | Docker | Application containerization |
| **Orchestration** | Docker Compose | Multi-service deployment |
| **DB Container** | PostgreSQL 16-Alpine | Lightweight, production-grade |
| **Networking** | Docker Bridge Network | Inter-service communication |
| **Persistence** | Named Volume (pgdata) | Database durability |
| **Configuration** | .env file | Environment-specific settings |

### External Services
| Service | Purpose | Integration |
|---------|---------|-------------|
| **Google Generative AI** | Chatbot & NLP | @google/generative-ai package |
| **SePay/VNPay** | Payment processing | Payment gateway for subscriptions |
| **Cloudinary** | Image CDN | Image storage & transformation |
| **PostgreSQL** | Data persistence | Primary database |

---

## 🏗️ System Architecture

### Three-Tier Architecture Diagram
```
┌──────────────────────────────────────────────────────────────┐
│                     Presentation Layer                        │
│         React SPA (Vite) + Redux + Tailwind CSS              │
│                    :5173 (Dev)                                │
└─────────────────────┬──────────────────────────────────────────┘
                      │ HTTP/REST API (JSON)
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│              Application Layer (API)                           │
│         Express.js with Middleware Pipeline                   │
│  ├─ CORS & Request Parsing                                    │
│  ├─ Authentication (JWT Verification)                         │
│  ├─ Validation (express-validator)                            │
│  ├─ Route Handlers & Controllers                              │
│  ├─ Service Layer (Business Logic)                            │
│  └─ Error Handling & Response Formatting                      │
│                    :5000 (Dev/Production)                      │
└──────────────┬─────────────────────┬──────────────────────────┘
               │                     │
        ┌──────▼────────┐    ┌──────▼─────────────┐
        │  PostgreSQL   │    │ External Services  │
        │      16       │    │                    │
        │  (:5432)      │    │ ├─ Google GenAI    │
        │               │    │ ├─ Cloudinary      │
        │ Docker Vol    │    │ ├─ SePay/VNPay     │
        │ (pgdata)      │    │ └─ Email Service   │
        └───────────────┘    └────────────────────┘
               │
        ┌──────▼──────────────────┐
        │   Sequelize ORM Layer   │
        │  ├─ User Model          │
        │  ├─ Book Model          │
        │  ├─ Author Model        │
        │  ├─ Chapter Model       │
        │  ├─ Comment Model       │
        │  ├─ Bookshelf Model     │
        │  ├─ Subscription Model  │
        │  └─ + 5 More Models     │
        └────────────────────────┘
                │
        ┌───────▼─────────────────┐
        │   AI/ML Pipeline        │
        │  (Python - Async)       │
        │                         │
        │ ├─ Data Pipeline        │
        │ ├─ Cosine Similarity    │
        │ ├─ Recommendation Gen   │
        │ └─ Model Serialization  │
        └─────────────────────────┘
```

### Data Flow Architecture
```
User Action (Click, Submit)
    ↓
React Component Dispatch Redux Action
    ↓
Redux-Observable Epic (Middleware)
    ↓
Service Layer (Axios HTTP Request)
    ↓
Express Router → Authentication → Validation
    ↓
Controller → Business Logic → Sequelize ORM
    ↓
PostgreSQL Query → Data Retrieval
    ↓
Response JSON ← ORM Mapping ← Query Results
    ↓
Redux State Update & Component Re-render
```

### Authentication Flow
```
Login Credentials → bcrypt Hash Verification
    ↓
JWT Token Generation (15m Access + 7d Refresh)
    ↓
Store Tokens (localStorage, Redux)
    ↓
Axios Interceptor: Add Authorization Header to Requests
    ↓
Backend: Verify JWT Signature & Expiration
    ↓
Access Denied OR Refresh Token → New Access Token
    ↓
Request Processing / Response
```


---

## 📁 Project Structure

```
GR2/
├── docker-compose.yml          # Multi-container orchestration
├── README.md                   # This file
│
├── FE/                         # Frontend (React + Vite)
│   ├── package.json            # Dependencies & npm scripts
│   ├── vite.config.js          # Vite bundler configuration
│   ├── tailwind.config.js      # Tailwind CSS settings
│   ├── jsconfig.json           # Path aliases (@/components, etc.)
│   ├── index.html              # HTML entry point
│   ├── STRUCTURE.md            # Detailed frontend architecture
│   └── src/
│       ├── main.jsx            # React root entry
│       ├── App.jsx             # Root component with routing
│       ├── App.css, index.css  # Global styles
│       ├── components/         # Reusable UI components
│       │   ├── ui/             # Primitive UI components (shadcn/ui)
│       │   ├── admin/          # Admin-only components
│       │   ├── auth/           # Authentication components
│       │   └── ...             # Feature-specific components
│       ├── pages/              # Full-page components (routes)
│       │   ├── HomePage.jsx
│       │   ├── SearchPage.jsx
│       │   ├── BookShelf.jsx
│       │   ├── Read.jsx        # Book reading interface
│       │   ├── admin/          # Admin-only pages
│       │   └── ...
│       ├── service/            # API client layer
│       │   ├── AuthService.jsx
│       │   ├── BookService.jsx
│       │   ├── HttpClient.jsx  # Axios instance with interceptors
│       │   └── ...
│       ├── store/              # Redux state management
│       │   ├── configureStore.jsx
│       │   ├── Auth/           # Auth slice & epics
│       │   ├── User/           # User slice & epics
│       │   └── ...
│       ├── contexts/           # React Context API
│       │   └── ProgressContext.jsx
│       ├── config/             # Configuration files
│       ├── lib/                # Utility functions
│       ├── hooks/              # Custom React hooks
│       ├── assets/             # Static assets
│       └── translations/       # i18n files (en.json, vi.json)
│
├── BE/                         # Backend (Node.js + Express)
│   └── api/
│       ├── Dockerfile          # Container image definition
│       ├── package.json        # Dependencies
│       ├── server.js           # Express app entry point
│       ├── config/             # Configuration
│       │   ├── db-config.js    # PostgreSQL connection (Sequelize)
│       │   ├── passport-config.js
│       │   └── cloudinary-config.js
│       ├── models/             # Sequelize ORM models
│       │   ├── user-model.js
│       │   ├── book-model.js
│       │   ├── author-model.js
│       │   ├── chapter-model.js
│       │   ├── comment-model.js
│       │   ├── bookshelf-model.js
│       │   ├── subscription-model.js
│       │   └── ... (14 models total)
│       ├── routes/             # Express route handlers
│       │   ├── auth-route.js
│       │   ├── book-route.js
│       │   ├── chapter-route.js
│       │   ├── comment-route.js
│       │   ├── user-route.js
│       │   └── ...
│       ├── controllers/        # Business logic
│       │   ├── auth-controller.js
│       │   ├── book-controller.js
│       │   ├── comment-controller.js
│       │   └── ...
│       ├── services/           # Service layer
│       │   ├── auth-service.js
│       │   ├── book-service.js
│       │   └── ...
│       ├── middlewares/        # Express middlewares
│       │   ├── auth-middleware.js
│       │   └── validation-middleware.js
│       ├── docs/               # API documentation
│       │   ├── userApi.md
│       │   ├── bookApi.md
│       │   ├── paymentApi.md
│       │   └── ...
│       └── utils/              # Utility functions
│
├── AI/                         # AI/ML Module (Python)
│   ├── train_model.py         # Recommendation model trainer
│   ├── requirements.txt        # Python dependencies
│   └── env/                    # Virtual environment
│       ├── Scripts/            # Python executables (Windows)
│       └── Lib/                # Site-packages
│
└── Data/                       # Database & seed files
    ├── schema_reference.sql    # Database schema documentation
    ├── creat_table.sql         # Table creation scripts
    └── books-1.py              # Data seeding scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **PostgreSQL** 16+ (or Docker)
- **Python** 3.8+ (for AI module)
- **Docker** & **Docker Compose** (for containerized setup)
- **Git** for version control

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd GR2
```

2. **Create `.env` file** in project root
```env
# Database Configuration
DB_USER=postgres
DB_PASS=your_secure_password
DB_NAME=web_2025_1
DB_PORT=5432
PORT=5000

# JWT Secrets (generate random strings)
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# External Services
GEMINI_API_KEY=your_google_genai_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payment Gateway
VEPAY_API_KEY=your_vepay_key
VEPAY_API_SECRET=your_vepay_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://thuviensach.io.vn
```

### Local Development Setup

#### Option 1: Docker Compose (Recommended)
```bash
# Build and start all services (PostgreSQL + Backend)
docker-compose up -d

# Verify services are running
docker ps

# View logs
docker-compose logs -f backend
docker-compose logs -f db

# Stop services
docker-compose down
```

#### Option 2: Manual Setup

**Backend Setup**:
```bash
cd BE/api
npm install
npm run dev  # Requires PostgreSQL running separately
```

**Frontend Setup**:
```bash
cd FE
npm install
npm run dev  # Starts at :5173
```

**AI Module Setup**:
```bash
cd AI
python -m venv env
source env/Scripts/activate  # Windows: env\Scripts\activate
pip install pandas numpy scikit-learn sqlalchemy psycopg2

# Run recommendation training
python train_model.py
```

---

## 🏃 Running the Application

### Development Mode

**All services via Docker**:
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

**Manual development**:
```bash
# Terminal 1: Backend
cd BE/api && npm run dev

# Terminal 2: Frontend  
cd FE && npm run dev

# Terminal 3: AI (optional - runs periodically)
cd AI && python train_model.py
```

### Production Build

**Build Docker images**:
```bash
docker-compose build
docker-compose up -d
```

**Frontend production build**:
```bash
cd FE
npm run build  # Output: dist/
npm run preview
```

**Backend production start**:
```bash
cd BE/api
npm install --production
node server.js
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User login (returns JWT tokens) |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | User logout |
| GET | `/profile` | Get current user profile |
| POST | `/google` | Google OAuth authentication |

### Book Management (`/api/books`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all books with pagination |
| GET | `/:id` | Get book details |
| GET | `/:id/chapters` | Get book chapters |
| POST | `/` | Create book (admin only) |
| PUT | `/:id` | Update book (admin only) |
| DELETE | `/:id` | Delete book (admin only) |
| GET | `/search?q=query` | Search books |
| GET | `/recommendations/:userId` | AI recommendations |

### User Management (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id` | Get user profile |
| PUT | `/:id` | Update user profile |
| GET | `/:id/bookshelf` | Get user's bookshelves |
| GET | `/:id/reading-history` | Get reading history |
| GET | `/:id/stats` | Get reading statistics |

### Comments & Reactions (`/api/comments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:bookId` | Get book comments |
| POST | `/` | Create comment |
| PUT | `/:id` | Update comment |
| DELETE | `/:id` | Delete comment |
| POST | `/:id/reactions` | Add reaction |

### Subscription & Payment (`/api/subscriptions`, `/api/payment`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get subscription plans |
| POST | `/subscribe` | Create subscription |
| POST | `/payment/callback` | VNPay callback |
| GET | `/transactions` | Get payment history |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform statistics |
| GET | `/users` | Manage users (admin) |
| GET | `/comments` | Review comments (admin) |
| PUT | `/comments/:id/approve` | Approve/reject comments |

**Full API Documentation**: See [`BE/api/docs/`](BE/api/docs/) directory

---

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Strategy**: Access tokens (15m) + Refresh tokens (7d)
- **Password Hashing**: bcrypt with 10 salt rounds
- **Role-Based Access Control (RBAC)**: Admin, User, Guest roles
- **Token Refresh**: Automatic token refresh via interceptors
- **CORS Whitelisting**: Only allow trusted origins

### Data Protection
- **Input Validation**: express-validator on all API endpoints
- **SQL Injection Prevention**: Sequelize parameterized queries
- **XSS Protection**: React auto-escapes content
- **CSRF Protection**: SameSite cookie policy
- **Rate Limiting**: Implement for authentication endpoints (recommended)

### Environment Security
- **Secrets Management**: `.env` file (never committed to git)
- **Sensitive Data**: No logging of passwords or API keys
- **HTTPS**: Required in production

---

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Vite automatic chunk splitting
- **Lazy Loading**: React.lazy() for route components
- **Redux Selectors**: Memoized selectors prevent unnecessary re-renders
- **Image Optimization**: Cloudinary CDN for images
- **Caching**: Redux Persist for client-side caching

### Backend
- **Database Indexing**: Indexes on frequently queried columns
- **Query Optimization**: Sequelize eager loading with include/associations
- **Pagination**: Limit results with offset/limit parameters
- **Caching Layer**: Redis (can be added for session/data caching)
- **Connection Pooling**: Sequelize connection pool configuration

### AI/ML
- **Async Processing**: Background job for model training
- **Scheduled Tasks**: node-cron for periodic recommendation generation
- **Data Batching**: Process records in batches to minimize memory

---

## 👥 Development Workflow

### Code Style & Standards

#### Frontend (React/JavaScript)
```javascript
// ✅ DO: Use functional components with hooks
export const UserCard = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
    </div>
  );
};

// ✅ DO: Use Redux for global state
import { useSelector, useDispatch } from 'react-redux';
const isAuth = useSelector(selectIsAuthenticated);

// ✅ DO: Use Tailwind classes for styling
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow" />

// ❌ DON'T: Use class components
// ❌ DON'T: Use inline styles
// ❌ DON'T: Mix Redux with useState for same data
```

#### Backend (Node.js/Express)
```javascript
// ✅ DO: Use async/await with proper error handling
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// ✅ DO: Validate inputs
const { validationResult } = require('express-validator');
if (!validationResult(req).isEmpty()) {
  return res.status(400).json({ errors: validationResult(req).array() });
}

// ✅ DO: Use dependency injection
const userService = new UserService(db);

// ❌ DON'T: Use callback hell
// ❌ DON'T: Skip validation
// ❌ DON'T: Commit .env or credentials
```

### Adding a New Feature

#### Frontend
1. Create Redux slice in `src/store/` (if state needed)
```javascript
// MyFeatureSlice.js
import { createSlice } from '@reduxjs/toolkit';

const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState: { data: null, loading: false },
  reducers: {
    setData: (state, action) => { state.data = action.payload; }
  }
});
```

2. Create service in `src/service/` for API calls
```javascript
// MyFeatureService.js
export const fetchMyData = async () => {
  const response = await httpClient.get('/api/myfeature');
  return response.data;
};
```

3. Create component in `src/components/`
4. Add route in `src/App.jsx`

#### Backend
1. Create model in `BE/api/models/`
2. Create route in `BE/api/routes/`
3. Create controller in `BE/api/controllers/`
4. Add validation middleware
5. Test with Postman or curl

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit regularly
git add .
git commit -m "feat: Add new feature description"

# Push to remote
git push origin feature/new-feature
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**:
- Check PostgreSQL is running: `docker-compose ps`
- Verify `.env` database credentials
- Reset database: `docker-compose down -v && docker-compose up -d`

#### 2. CORS Error
```
Access-Control-Allow-Origin error
```
**Solution**:
- Check frontend URL is in `ALLOWED_ORIGINS` in `.env`
- Verify backend has CORS middleware enabled
- Check if running on correct port

#### 3. JWT Token Expired
```
401 Unauthorized: Token expired
```
**Solution**:
- Axios interceptor should automatically refresh token
- Check `JWT_REFRESH_SECRET` in `.env`
- Clear localStorage and re-login

#### 4. Vite Hot Module Replacement Not Working
```bash
npm run dev  # Restart dev server
# Clear browser cache
# Check firewall settings
```

#### 5. Python Recommendation Model Issues
```bash
# Activate virtual environment
source AI/env/Scripts/activate  # Windows: AI\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run training
python AI/train_model.py
```

---

## 🗄️ Database Schema Overview

### Core Tables

#### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR,
  role ENUM ('admin', 'user', 'guest'),
  created_at TIMESTAMP DEFAULT now()
)
```

#### Books Table
```sql
books (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  author_id INTEGER REFERENCES authors,
  category_id INTEGER REFERENCES subjects,
  rating FLOAT,
  cover_image VARCHAR,
  created_at TIMESTAMP DEFAULT now()
)
```

#### Comments Table
```sql
comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users,
  book_id INTEGER REFERENCES books,
  content TEXT NOT NULL,
  rating INTEGER (1-5),
  created_at TIMESTAMP DEFAULT now()
)
```

**Full Schema**: See [`Data/schema_reference.sql`](Data/schema_reference.sql)

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| [FE/STRUCTURE.md](FE/STRUCTURE.md) | Frontend architecture & component guide |
| [BE/api/docs/userApi.md](BE/api/docs/userApi.md) | User API endpoints |
| [BE/api/docs/bookApi.md](BE/api/docs/bookApi.md) | Book API endpoints |
| [BE/api/docs/paymentApi.md](BE/api/docs/paymentApi.md) | Payment/Subscription API |
| [Data/schema_reference.sql](Data/schema_reference.sql) | Database schema reference |

---

## 🎯 Development Tips

### Debugging
```javascript
// Frontend: Redux DevTools Extension
// Install browser extension and inspect state changes

// Backend: Strategic logging
console.log('DEBUG:', { userId, action, result });

// Database: Direct queries
psql postgresql://user:pass@localhost/dbname
SELECT * FROM users WHERE id = 1;
```

### Performance Monitoring
```javascript
// Response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});
```

---

## 🤝 Contributing

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests pass: `npm test`
- [ ] No console errors/warnings
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance acceptable (<3s load time)
- [ ] Documentation updated
- [ ] Pull request description clear

### Setting Up Pre-commit Hooks
```bash
npm install husky lint-staged --save-dev
npx husky install
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Frontend Components | ~40+ |
| Backend Routes | ~14 |
| Database Models | ~14 |
| API Endpoints | ~50+ |
| Languages | JavaScript, Python, SQL |
| Estimated LOC | ~15,000+ |

---

## 📝 License & Credits

This project is developed as a comprehensive digital library platform for Vietnamese readers.

### Key Technologies
- React & Vite - Modern frontend development
- Express.js & Node.js - Scalable backend
- PostgreSQL - Reliable data persistence
- Google GenAI - AI-powered features
- Tailwind CSS & shadcn-ui - Beautiful UI components

---

## 📞 Support & Contact

### Getting Help
1. **Documentation**: Check [FE/STRUCTURE.md](FE/STRUCTURE.md) first
2. **Issues**: Create GitHub Issue with reproduction steps
3. **Questions**: Check existing discussions or create new one
4. **Bugs**: Report with detailed information and screenshots

### Quick Start Checklist
- [ ] Clone repository
- [ ] Create and configure `.env` file
- [ ] Run `docker-compose up -d` 
- [ ] Verify services: `docker ps`
- [ ] Frontend: `http://localhost:5173`
- [ ] Backend: `http://localhost:5000`
- [ ] Ready to develop!

### Useful Commands
```bash
# Docker
docker-compose up -d          # Start all services
docker-compose down           # Stop services
docker-compose logs -f        # View logs

# Frontend
cd FE && npm run dev          # Start dev server
npm run build                 # Production build

# Backend
cd BE/api && npm run dev      # Start API server
npm run lint                  # Code quality check

# Database
docker exec db-gr2-container psql -U postgres -d web_2025_1
```

---

**Last Updated**: June 2026  
**Project Version**: 2.0  
**Status**: Active Development  
**Maintainers**: GR3 Development Team
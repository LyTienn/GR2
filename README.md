# BookSystem - Digital Library & Book Management Platform

A comprehensive, full-stack digital library and book management platform that combines modern web technologies with AI-powered recommendations, social features, and payment integration. GR2 provides a complete ecosystem for readers to discover, organize, and engage with books in an intuitive, feature-rich environment.

---

## 📚 Overview

BookSystem is a production-ready digital library platform designed to serve readers, library managers, and administrators. It offers a seamless experience for discovering books, managing personal collections, participating in a reading community, and accessing premium content through a subscription-based model.

### Core Purpose
Create an engaging, scalable platform that modernizes the way people discover and interact with books through technology, AI recommendations, and community features.

### Key Features

- **📖 Book Management**: Comprehensive book catalog with detailed metadata, authors, subjects, chapters, and reading progress tracking
- **🔐 User Authentication**: Secure JWT-based authentication with role-based access control (admin, user, guest)
- **👥 Social Features**: Comment system, reactions, user ratings, and community engagement tools
- **📚 Personal Bookshelves**: Create and manage custom book collections with categorization and annotations
- **🤖 AI-Powered Recommendations**: Collaborative filtering algorithm for intelligent book suggestions based on user preferences and reading history
- **💳 Payment & Subscription System**: Integrated VNPay payment gateway for subscription management and membership tiers
- **👨‍💼 Admin Dashboard**: Comprehensive moderation tools for managing users, books, comments, and platform statistics
- **📖 Reading Tools**: Chapter management, reading notes, bookmarks, and progress tracking
- **💬 AI Chatbot**: Google GenAI-powered intelligent chatbot for user assistance and book information queries
- **🌍 Internationalization**: Multi-language support (i18n) for global accessibility
- **🎨 Dark Mode**: Theme switching for enhanced user experience and accessibility

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.1 with Vite 7.1.7 (fast build and dev server)
- **State Management**: Redux Toolkit 2.11.0 with Redux Persist for persistent state
- **Routing**: React Router 7.9.6 for client-side navigation
- **Styling**: Tailwind CSS 4.0 with PostCSS for utility-first CSS
- **UI Components**: 
  - shadcn-ui and Radix UI for accessible, composable components
  - Custom components built with React + Tailwind
- **HTTP Client**: Axios 1.13.2 for API communication
- **Key Libraries**:
  - `react-markdown` + `remark-gfm`: Markdown rendering with GitHub Flavored Markdown
  - `recharts`: Data visualization and analytics
  - `GSAP` + `Swiper`: Smooth animations and carousel components
  - `i18next`: Internationalization framework
  - `react-toastify`, `Sonner`: Toast notifications
  - `RxJS 7.8.2`: Reactive programming with Redux-Observable
- **Linting**: ESLint with React hooks plugin for code quality
- **Build**: Vite with HMR (Hot Module Replacement) for fast development

### Backend
- **Runtime**: Node.js with Express 5.1.0 web framework
- **Database**: PostgreSQL 16 with Sequelize 6.37.7 ORM
- **Authentication**: 
  - JWT (jsonwebtoken 9.0.2) for token-based auth
  - bcrypt for password hashing
  - Access tokens (15m) + Refresh tokens (7d)
- **AI/ML Integration**:
  - Google GenAI (@google/generative-ai) for chatbot
  - LangChain (@langchain/core, @langchain/google-genai) for AI orchestration
- **Validation**: express-validator 7.3.1 for request validation
- **Task Scheduling**: node-cron 4.2.1 for scheduled jobs
- **Security**: 
  - CORS for cross-origin requests with configurable origins
  - Cookie-parser for cookie management
- **Development**: Nodemon for automatic server restart on code changes
- **Utilities**: Axios for external API calls, dotenv for environment configuration

### AI/ML Module
- **Language**: Python
- **Libraries**: Pandas, NumPy, Scikit-learn
- **Algorithm**: Cosine Similarity for collaborative filtering
- **Functionality**: 
  - Builds user-item utility matrix from book ratings
  - Calculates cosine similarity between books
  - Generates top-5 recommendations per book
  - Output: JSON recommendation model for backend integration

### Infrastructure
- **Containerization**: Docker and Docker Compose for reproducible deployments
- **Database Container**: PostgreSQL 16-Alpine (lightweight, production-grade)
- **Backend Container**: Custom Node.js image (Dockerfile in BE/api)
- **Networking**: Docker bridge network (`app-network`) for inter-service communication
- **Persistence**: Named volume `pgdata` for PostgreSQL data durability
- **Environment**: Configurable via `.env` file for different deployment scenarios

### External Services
- **Payment Gateway**: SePay for subscription and payment processing
- **AI Services**: Google Generative AI for chatbot and NLP features
- **Database**: PostgreSQL relational database management

---

## 🏗️ Architecture Overview

### System Architecture

The GR2 platform follows a modern three-tier architecture with AI and external service integration:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  React SPA (Vite) + Redux + Tailwind CSS (Port 5173)        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│              API Layer (Express.js)                         │
│  ├─ Authentication & Authorization (JWT)                    │
│  ├─ Request Validation & Error Handling                     │
│  ├─ Business Logic Controllers                              │
│  └─ Route Management (Port 5000)                            │
└────────────┬───────────────┬────────────────────────────────┘
             │               │              
    ┌────────▼──────┐     ┌──▼────────────┐
    │ PostgreSQL 16 │     │ Google GenAI  │
    │ (Docker)      │     │ (AI Services) │
    └───────────────┘     └───────────────┘
             │
    ┌────────▼──────────────────┐
    │   Sequelize ORM Models    │
    │  ├─ User, Book, Author    │
    │  ├─ Comment, Bookshelf    │
    │  ├─ Subscription, Chapter │
    │  └─ + 8 More Models       │
    └───────────────────────────┘

Parallel AI/ML Pipeline:
    Python Collaborative Filtering → Recommendation Model
    ├─ Cosine Similarity Algorithm
    ├─ User-Item Rating Matrix
    └─ Top-5 Book Recommendations
```

### Data Flow

1. **User Request**: Client sends HTTP request with JWT token
2. **Authentication**: Express middleware validates JWT and user permissions
3. **Validation**: Request data validated against schemas
4. **Processing**: Controller delegates to service layer for business logic
5. **Database**: Sequelize ORM interacts with PostgreSQL
6. **Response**: Data formatted and returned to client via JSON
7. **External Services**: Cloudinary for files, Google GenAI for AI features, SePay for payments


## 🔐 Security Features

- **Authentication**: JWT tokens with expiration and refresh mechanism
- **Password Security**: bcrypt hashing with salt rounds
- **CORS**: Configurable cross-origin requests with whitelisted origins
- **Input Validation**: Server-side request validation using express-validator
- **Role-Based Access**: Admin, user, and guest role enforcement
- **Token Expiration**: Short-lived access tokens (15m) with refresh tokens (7d)
- **Environment Secrets**: Sensitive data managed via `.env` file (never committed)

---

## 📈 Performance Considerations

- **Caching**: Redux persistence for client-side state caching
- **API Optimization**: Pagination, filtering, and sorting on book and comment endpoints
- **Image Optimization**: Cloudinary CDN for image delivery and transformation
- **Database Indexing**: Indexes on frequently queried columns (user_id, book_id, etc.)
- **Lazy Loading**: React components with code splitting via Vite
- **Virtual Scrolling**: Efficient rendering of large lists
- **Build Optimization**: Vite's rollup bundler for minimal bundle size

---

## 🌐 CORS Configuration

The backend accepts requests from:
- `http://localhost:5173` (development frontend)
- `http://localhost:5174` (alternative dev port)
- `https://thuviensach.io.vn/` (production domain)
- Credentials: Enabled for cookie-based sessions


## 📞 Support & Documentation

- **Frontend Documentation**: See [FE/STRUCTURE.md](FE/STRUCTURE.md) for component architecture
- **API Documentation**: Detailed API docs available in `BE/api/docs/` directory
- **Database Schema**: See `Data/schema_reference.sql` for table definitions
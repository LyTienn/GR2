# Frontend Directory Structure

```
FE/
   ├── components.json
   ├── eslint.config.js
   ├── index.html
   ├── jsconfig.json
   ├── package.json
   ├── postcss.config.js
   ├── README.md
   ├── STRUCTURE.md
   ├── tailwind.config.js
   ├── vite.config.js
   ├── public/
   ├── dist/
   └── src/
       ├── App.css
       ├── App.jsx
       ├── index.css
       ├── main.jsx
       ├── assets/
       ├── components/
       │   ├── Account-sidebar.jsx
       │   ├── AudioPlayer.jsx
       │   ├── BookCard.jsx
       │   ├── BookSection.jsx
       │   ├── Chatbot/
       │   │   └── Chatbot.jsx
       │   ├── ComicReader.jsx
       │   ├── CommentMenu.jsx
       │   ├── GlobalProgressTracker.jsx
       │   ├── HeaderBar.jsx
       │   ├── IntroHero.jsx
       │   ├── ListSection.jsx
       │   ├── Review-dialog.jsx
       │   ├── Review-section.jsx
       │   ├── Search.jsx
       │   ├── admin/
       │   │   ├── AdminLayout.jsx
       │   │   ├── Pagination.jsx
       │   │   └── RequireAdmin.jsx
       │   ├── auth/
       │   │   ├── LoginForm.jsx
       │   │   └── RegisterForm.jsx
       │   ├── transaction/
       │   │   ├── TransactionCard.jsx
       │   │   ├── TransactionFilter.jsx
       │   │   └── TransactionStats.jsx
       │   └── ui/
       │       ├── badge.jsx
       │       ├── button.jsx
       │       ├── card.jsx
       │       ├── dialog.jsx
       │       ├── dropdown-menu.jsx
       │       ├── input.jsx
       │       ├── label.jsx
       │       ├── pdf-viewer.jsx
       │       ├── select.jsx
       │       ├── switch.jsx
       │       ├── tabs.jsx
       │       └── textarea.jsx
       ├── config/
       │   └── Axios-config.jsx
       ├── contexts/
       │   └── ProgressContext.jsx
       ├── lib/
       │   └── utils.js
       ├── pages/
       │   ├── BookShelf.jsx
       │   ├── HomePage.jsx
       │   ├── Login.jsx
       │   ├── Membership.jsx
       │   ├── Profile.jsx
       │   ├── Read.jsx
       │   ├── Register.jsx
       │   ├── SearchPage.jsx
       │   ├── Transactions.jsx
       │   └── admin/
       │       ├── Authors.jsx
       │       ├── BookAnalytics.jsx
       │       ├── Books.jsx
       │       ├── Bookshelves.jsx
       │       ├── CommentsModeration.jsx
       │       ├── Dashboard.jsx
       │       ├── Registrations.jsx
       │       ├── Settings.jsx
       │       ├── Subjects.jsx
       │       └── Users.jsx
       ├── service/
       │   ├── AdminAuthorService.jsx
       │   ├── AdminBookService.jsx
       │   ├── AdminChapterService.js
       │   ├── AdminStatsService.jsx
       │   ├── AdminSubjectService.jsx
       │   ├── AdminSubscriptionService.js
       │   ├── AdminUserService.jsx
       │   ├── AuthService.jsx
       │   ├── BookshelfAdminService.jsx
       │   ├── HttpClient.jsx
       │   ├── HttpHelper.jsx
       │   ├── PaymentService.jsx
       │   ├── reduxHelper.jsx
       │   └── UserService.jsx
       └── store/
           ├── Auth/
           │   ├── authEpic.js
           │   ├── authSelector.js
           │   ├── authSlice.jsx
           │   └── index.js
           ├── User/
           │   ├── UserSlice.jsx
           │   └── UserThunk.jsx
           ├── configureStore.jsx
           ├── epics.js
           ├── index.js
           └── reducers.js

# YSC Lunch Soccer ⚽

A web application for managing lunchtime soccer sessions, RSVPs, team randomization, and communication for YSC (Yale Soccer Club) members.

## 🎯 Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Session Management**: Automatically generates Monday and Friday lunch soccer sessions
- **RSVP System**: Users can RSVP as "Yes", "Maybe", or "Can't Make It"
- **Team Randomization**: Automatically creates balanced teams (2-4 teams based on attendance)
- **Session Chat**: Real-time messaging for each session
- **Skill Level Tracking**: Users can set their skill level (1-10)
- **Admin Features**: Admins can randomize teams and manage sessions
- **Attendance Tracking**: View who's attending each session with capacity limits (45 max)

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework
- **React 19** - UI library
- **Framer Motion** - Animations
- **SCSS** - Styling
- **React Icons** - Icon library

### Backend

- **Express.js** - Web server
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Supabase** - Authentication
- **Node Cron** - Scheduled tasks (session generation)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account (for authentication)
- npm, yarn, pnpm, or bun

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd YSCLunchSoccer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ysclunchsoccer"
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
FRONTEND_URL="http://localhost:3000"
PORT=5001
NODE_ENV=development
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
YSCLunchSoccer/
├── backend/
│   ├── src/
│   │   ├── db/              # Database client
│   │   ├── lib/             # Utilities (Supabase)
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes (auth, sessions, messages)
│   │   ├── utils/           # Helper functions
│   │   └── server.js         # Express server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── load-test-signup.js      # Load testing script
│   └── cleanup-test-users.js    # Test user cleanup script
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   └── lib/             # Utilities and API clients
│   └── public/              # Static assets
└── README.md
```

## 🔧 Available Scripts

### Backend

```bash
npm run dev              # Start development server with nodemon
npm start                # Start production server
npm run load-test        # Run load testing script for signup endpoint
npm run cleanup-test-users  # Clean up test users from database
npm run auth:list        # List all Supabase auth users
npm run auth:find        # Find user by email
npm run auth:delete      # Delete user by email
```

### Frontend

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## 🗄️ Database Schema

- **User**: Stores user information, skill level, and admin status
- **Session**: Stores session dates, times, and timezone
- **Attendance**: Links users to sessions with RSVP status
- **Message**: Stores chat messages for each session

## 🔄 Session Generation

Sessions are automatically generated:

- **Schedule**: Every Monday and Friday at 11:45 AM - 1:05 PM EST
- **Auto-generation**: Runs every Friday at midnight via cron job
- **Maintenance**: Old sessions are automatically deleted
- **Capacity**: Maintains 6 upcoming sessions at all times

## 🧪 Testing

### Load Testing

Test the signup endpoint with multiple concurrent requests:

```bash
cd backend
npm run load-test -- --users 50 --concurrent 10
```

Options:

- `--users <number>`: Number of users to create (default: 10)
- `--concurrent <number>`: Concurrent requests (default: 5)
- `--url <url>`: API base URL (default: http://localhost:5001)
- `--delay <ms>`: Delay between batches (default: 100ms)

### Cleanup Test Users

After testing, clean up test users:

```bash
cd backend
npm run cleanup-test-users -- --dry-run    # Preview what will be deleted
npm run cleanup-test-users -- --confirm     # Delete test users
```

Options:

- `--pattern <pattern>`: Email pattern to match (default: @example.com)
- `--name <pattern>`: Name pattern to match (default: Test User)
- `--dry-run`: Preview without deleting
- `--confirm`: Skip confirmation prompt

## 🌐 Deployment

### Environment Variables

Make sure to set the following environment variables in your production environment:

**Backend:**

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL` (your production frontend URL)
- `PORT`
- `NODE_ENV=production`

**Frontend:**

- `NEXT_PUBLIC_API_URL` (your production backend URL)

### Database Migrations

Run migrations in production:

```bash
cd backend
npx prisma migrate deploy
```

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Sessions

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions/:id/attend` - RSVP to session

### Messages

- `GET /api/messages/:sessionId` - Get messages for session
- `POST /api/messages` - Send message to session

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Built for YSC (Yale Soccer Club) members
- Thanks to all contributors and testers

---

Made with ⚽ for the YSC community

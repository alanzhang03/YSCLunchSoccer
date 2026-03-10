# YSC Lunch Soccer

A web application for managing lunchtime soccer sessions, RSVPs, team randomization, and communication for YSC sports lunch soccer members.

## Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Session Management**: Automatically generates Monday and Friday lunch soccer sessions
- **RSVP System**: Users can RSVP as "Yes", "Maybe", or "Can't Make It"
- **Team Randomization**: Automatically creates balanced teams (2-6 teams based on attendance or admin input) with drag-and-drop player management
- **Team Locking**: Admins can lock teams to prevent further changes, with support for adding late-joining players
- **Session Chat**: Real-time messaging for each session
- **Skill Level Tracking**: Users can set their skill level (1-10) used for team balancing
- **SMS Notifications**: Admins can send Twilio SMS reminders to opted-in attendees
- **Admin Panel**: Admins can manage users, sessions, teams, and send notifications
- **Attendance Tracking**: View who's attending each session with capacity limits (45 max)
- **Stripe Payments**: Session payment tracking and checkout integration

## Tech Stack

### Frontend

- **Next.js 16** - React framework
- **React 19** - UI library
- **Framer Motion** - Animations
- **SCSS** - Styling
- **dnd-kit** - Drag-and-drop for team management

### Backend

- **Express.js** - Web server
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Supabase** - Authentication
- **Twilio** - SMS notifications
- **Stripe** - Payment processing
- **Node Cron** - Scheduled tasks (session generation)

## Project Structure

```
YSCLunchSoccer/
├── backend/
│   ├── src/
│   │   ├── db/              # Database client
│   │   ├── lib/             # Twilio and Supabase clients
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes (auth, sessions, messages, sms, checkout, admin)
│   │   ├── utils/           # Helper functions (session generator, SMS templates)
│   │   └── server.js        # Express server
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

## Database Schema

- **User**: Stores user info, skill level, admin status, and SMS opt-in preference
- **Session**: Stores session dates, times, timezone, team data, and lock state
- **Attendance**: Links users to sessions with RSVP status
- **Message**: Stores chat messages for each session
- **Payment**: Tracks Stripe payment status per user per session

## Session Generation

Sessions are automatically generated:

- **Schedule**: Every Monday and Friday at 11:20 AM - 1:05 PM EST
- **Auto-generation**: Runs every Friday at midnight via cron job
- **Maintenance**: Old sessions are automatically deleted
- **Capacity**: Maintains 6 upcoming sessions at all times

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `POST /api/auth/contact` - Submit contact form

### Sessions

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `GET /api/sessions/:id/attendances` - Get session attendances
- `POST /api/sessions` - Create a new session (admin only)
- `POST /api/sessions/:id/attend` - RSVP to session
- `POST /api/sessions/rsvp-multiple` - RSVP to multiple sessions
- `POST /api/sessions/:id/delete` - Delete session (admin only)
- `POST /api/sessions/:id/lockTeams` - Lock teams for a session (admin only)
- `POST /api/sessions/:id/attendances/delete` - Remove attendees (admin only)
- `PATCH /api/sessions/:id/showTeams` - Toggle team visibility (admin only)
- `PATCH /api/sessions/:id/teamsLocked` - Update teams locked state (admin only)
- `PATCH /api/sessions/:id/time` - Update session time (admin only)

### Messages

- `GET /api/messages/:sessionId` - Get messages for session
- `POST /api/messages` - Send message to session

### SMS

- `POST /api/sms/:sessionId/send` - Send SMS to opted-in attendees (admin only)

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:userId` - Update a user (admin only)

### Payments

- `POST /api/checkout` - Create Stripe checkout session
- `GET /api/checkout/session/:sessionId/status` - Get payment status
- `GET /api/checkout/session/:sessionId/all-statuses` - Get all payment statuses for a session
- `PATCH /api/checkout/session/:sessionId/user/:userId/payment-status` - Update payment status (admin only)

## Environment Variables

### Backend

```
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_ANON_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FRONTEND_URL
PRODUCTION_URL
```

## License

This project is private and proprietary.

## Authors

- Alan Zhang

---

Made for the YSC community

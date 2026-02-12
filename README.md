# YSC Lunch Soccer

A web application for managing lunchtime soccer sessions, RSVPs, team randomization, and communication for YSC sports lunch soccer members.

## Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Session Management**: Automatically generates Monday and Friday lunch soccer sessions
- **RSVP System**: Users can RSVP as "Yes", "Maybe", or "Can't Make It"
- **Team Randomization**: Automatically creates balanced teams (2-4 teams based on attendance)
- **Session Chat**: Real-time messaging for each session
- **Skill Level Tracking**: Users can set their skill level (1-10)
- **Admin Features**: Admins can randomize teams and manage sessions
- **Attendance Tracking**: View who's attending each session with capacity limits (45 max)

## Tech Stack

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

##  Project Structure

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

## Database Schema

- **User**: Stores user information, skill level, and admin status
- **Session**: Stores session dates, times, and timezone
- **Attendance**: Links users to sessions with RSVP status
- **Message**: Stores chat messages for each session

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

### Sessions

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions/:id/attend` - RSVP to session

### Messages

- `GET /api/messages/:sessionId` - Get messages for session
- `POST /api/messages` - Send message to session

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Authors

- Alan Zhang

## Acknowledgments

- Built for YSC sports lunch soccer members
- Thanks to all testers!

---

Made for the YSC community

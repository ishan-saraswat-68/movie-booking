# 🎬 BookMyShow Clone — MERN Stack

A full-stack Movie Ticket Booking App inspired by BookMyShow, built with the MERN stack.

## ✨ Features

### User
- Browse movies with search & genre filter
- View movie details, cast, and showtimes
- Date-wise show availability grouped by theatre
- Interactive seat selection (Recliner / Gold / Silver)
- Book tickets with live seat availability
- View booking confirmation with ticket card
- Cancel bookings with auto-refund
- User authentication (Register / Login)

### Admin
- Dashboard with stats overview
- Add / Edit / Delete movies
- Add / Edit / Delete theatres with seat layout
- Schedule shows (movie + theatre + date + time + format)
- View all bookings

## 🛠 Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS     |
| State     | Redux Toolkit                    |
| Routing   | React Router v6                  |
| Backend   | Node.js, Express.js              |
| Database  | MongoDB + Mongoose               |
| Auth      | JWT + bcryptjs                   |

## 📁 Project Structure

```
movie-booking/
├── server/                   # Express backend
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Show.js
│   │   └── Booking.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── theatres.js
│   │   ├── shows.js
│   │   └── bookings.js
│   ├── middleware/
│   │   └── auth.js           # JWT protect + adminOnly
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── client/                   # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── MovieCard.jsx
    │   │   └── SeatLayout.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── MovieDetails.jsx
    │   │   ├── BookingPage.jsx
    │   │   ├── BookingConfirmation.jsx
    │   │   ├── MyBookings.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminMovies.jsx
    │   │       ├── AdminTheatres.jsx
    │   │       └── AdminShows.jsx
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/authSlice.js
    │   ├── utils/api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
# Install all dependencies
npm install          # root (for concurrently)
npm run install-all  # installs server + client deps
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Run Development Servers
```bash
# From root — runs both server and client together
npm run dev

# OR separately:
npm run server   # Express on :5001
npm run client   # Vite on :5173
```

### 4. Create Admin User
Register normally, then update your user's role to `admin` in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/movies | List all movies |
| GET | /api/movies/:id | Movie detail |
| POST | /api/movies | Add movie (admin) |
| PUT | /api/movies/:id | Update movie (admin) |
| DELETE | /api/movies/:id | Delete movie (admin) |

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/shows?movie=&date= | List shows with filters |
| GET | /api/shows/:id | Show detail + booked seats |
| POST | /api/shows | Add show (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create booking |
| GET | /api/bookings/my | My bookings |
| GET | /api/bookings/:id | Booking detail |
| PUT | /api/bookings/:id/cancel | Cancel booking |

## 🪑 Seat Layout

```
SCREEN
─────────────────────────────
A B  [ RECLINER ] ₹500
─────────────────────────────
C D E  [ GOLD ]   ₹300
─────────────────────────────
F G H  [ SILVER ] ₹180
─────────────────────────────
```

Each row has 10 seats (A1–A10, B1–B10, etc.) = 80 total seats.

## 🔒 Route Protection
- `/booking/*` — requires login
- `/my-bookings` — requires login
- `/admin/*` — requires admin role

## 📦 Deployment
- **Backend:** Deploy to Railway / Render / Heroku
- **Frontend:** Deploy to Vercel / Netlify (set `VITE_API_URL` if needed)
- **Database:** MongoDB Atlas (free tier)

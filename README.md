# 🎬 CINEVERSE — Real-Time Movie Booking Platform

> A full-stack, production-grade movie ticket booking system built with the **MERN stack**, enhanced with **Redis** for distributed seat locking and **Socket.IO** for real-time synchronization — preventing double bookings across concurrent users.

---

## 📑 Table of Contents

- [Introduction](#-introduction)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Use Case Diagram](#-use-case-diagram)
- [Class Diagram (Data Models)](#-class-diagram-data-models)
- [Sequence Diagrams](#-sequence-diagrams)
- [Activity Diagrams](#-activity-diagrams)
- [Project Structure](#-project-structure)
- [Features Deep Dive](#-features-deep-dive)
- [API Reference](#-api-reference)
- [Real-Time Seat Locking (Redis + Socket.IO)](#-real-time-seat-locking-redis--socketio)
- [Frontend Architecture](#-frontend-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Default Credentials](#-default-credentials)

---

## 🧠 Introduction

**Cineverse** is not a simple CRUD app — it solves the real-world **distributed concurrency problem** of ticket booking. When two users try to book the same seat at the same time, the system must guarantee that only one succeeds. This is achieved through a **dual-layer architecture**:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Permanent Truth** | MongoDB | Stores confirmed bookings forever |
| **Temporary Locks** | Redis | Holds 5-minute seat reservations (TTL) |
| **Live Sync** | Socket.IO | Broadcasts lock/unlock/book events instantly |

**Key Principle:** MongoDB is the **final source of truth**. Redis is the **temporary state manager**. Socket.IO is the **real-time messenger**.

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React + Vite | 18.x |
| State Management | Redux Toolkit | 2.x |
| Styling | TailwindCSS | 3.x |
| Backend | Node.js + Express | 4.18 |
| Database | MongoDB + Mongoose | 8.x |
| Cache / Locking | Redis | 5.x |
| Real-Time | Socket.IO | 4.8 |
| Auth | JWT + bcryptjs | — |
| HTTP Client | Axios | — |

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph Client ["🖥 Frontend (React + Vite)"]
        UI["UI Components"]
        Redux["Redux Store"]
        SocketClient["Socket.IO Client"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph Server ["⚙️ Backend (Node.js + Express)"]
        API["REST API Routes"]
        AuthMW["Auth Middleware (JWT)"]
        SocketServer["Socket.IO Server"]
    end

    subgraph Data ["💾 Data Layer"]
        MongoDB[("MongoDB\n(Permanent Truth)")]
        Redis[("Redis\n(Temporary Locks)")]
    end

    UI --> Redux
    UI --> AxiosClient
    UI --> SocketClient
    AxiosClient -->|"HTTP /api/*"| API
    SocketClient <-->|"WebSocket"| SocketServer
    API --> AuthMW
    AuthMW --> MongoDB
    API -->|"Lock/Unlock"| Redis
    API -->|"Book seats"| MongoDB
    SocketServer -->|"Emit events"| SocketClient
    API -->|"Clear locks on booking"| Redis
```

### How Data Flows

1. **User browses movies** → Frontend calls `GET /api/movies` → Express queries MongoDB → Returns JSON
2. **User selects a seat** → Frontend calls `POST /api/shows/:id/lock` → Express writes to Redis (5min TTL) → Socket.IO broadcasts `seat-locked` to all users viewing that show
3. **User pays** → Frontend calls `POST /api/bookings` → Express verifies Redis lock → Writes to MongoDB → Clears Redis lock → Socket.IO broadcasts `seat-booked`
4. **Lock expires** → Redis auto-deletes after 5 minutes → Seat becomes available again

---

## 📊 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        User["👤 User"]
        Admin["👑 Admin"]
    end

    subgraph UserActions ["User Actions"]
        UC1["Register / Login"]
        UC2["Browse Movies"]
        UC3["Filter by Genre"]
        UC4["View Movie Details"]
        UC5["Select Show Date & Time"]
        UC6["Select Seats (Real-Time)"]
        UC7["Make Payment"]
        UC8["Cancel Payment"]
        UC9["View Booking Confirmation"]
        UC10["View My Bookings"]
        UC11["Cancel Booking"]
        UC12["Edit Profile"]
    end

    subgraph AdminActions ["Admin Actions"]
        UC13["View Dashboard Stats"]
        UC14["Manage Movies (CRUD)"]
        UC15["Manage Theatres (CRUD)"]
        UC16["Manage Shows (CRUD)"]
        UC17["View All Bookings"]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12

    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC1
```

---

## 📐 Class Diagram (Data Models)

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String password
        +String phone
        +String role [user | admin]
        +Date createdAt
        +comparePassword(candidate) Boolean
    }

    class Movie {
        +String title
        +String description
        +String[] genre
        +String[] language
        +Number duration
        +Date releaseDate
        +String poster
        +String director
        +Number rating
        +Number totalReviews
        +Boolean isActive
    }

    class Theatre {
        +String name
        +String address
        +String city
        +String state
        +String pincode
        +Number totalSeats
        +Object seatLayout
        +Boolean isActive
    }

    class Show {
        +ObjectId movie
        +ObjectId theatre
        +Date date
        +String time
        +String language
        +String format [2D|3D|IMAX|4DX]
        +Number totalSeats
        +String[] bookedSeats
        +Object price
        +Boolean isActive
    }

    class Booking {
        +ObjectId user
        +ObjectId show
        +String[] seats
        +Number totalAmount
        +String paymentStatus
        +String bookingId
        +String status [confirmed|cancelled]
        +Date createdAt
    }

    User "1" --> "*" Booking : places
    Show "1" --> "*" Booking : has
    Movie "1" --> "*" Show : screened in
    Theatre "1" --> "*" Show : hosts
```

### Seat Layout Structure (Theatre)

```json
{
  "rows": 8,
  "cols": 10,
  "categories": [
    { "name": "Recliner", "rows": ["A", "B"], "price": 500 },
    { "name": "Gold",     "rows": ["C", "D", "E"], "price": 300 },
    { "name": "Silver",   "rows": ["F", "G", "H"], "price": 180 }
  ]
}
```

---

## 🔄 Sequence Diagrams

### 1. Seat Selection & Booking Flow

```mermaid
sequenceDiagram
    actor UserA as User A
    actor UserB as User B
    participant FE as Frontend
    participant BE as Backend API
    participant Redis as Redis Cache
    participant Mongo as MongoDB
    participant WS as Socket.IO

    Note over UserA, WS: Both users viewing same show

    UserA->>FE: Clicks seat A1
    FE->>BE: POST /shows/:id/lock {seatId: A1}
    BE->>Redis: hGet(seat_lock:showId, A1)
    Redis-->>BE: null (not locked)
    BE->>Mongo: Check bookedSeats
    Mongo-->>BE: Not booked
    BE->>Redis: hSet(seat_lock:showId, A1, userA_id)
    BE->>Redis: expire(key, 300)
    BE->>WS: emit("seat-locked", {seatId: A1})
    WS-->>UserB: seat-locked event
    Note over UserB: Seat A1 turns ORANGE (locked)
    BE-->>FE: 200 OK

    UserB->>FE: Clicks seat A1
    FE->>BE: POST /shows/:id/lock {seatId: A1}
    BE->>Redis: hGet(seat_lock:showId, A1)
    Redis-->>BE: userA_id (locked by someone else)
    BE-->>FE: 400 "Seat already locked"
    Note over UserB: Toast error shown

    UserA->>FE: Clicks "Initialize Payment"
    Note over FE: 10-second countdown starts
    FE->>BE: POST /bookings {showId, seats, totalAmount}
    BE->>Mongo: Check bookedSeats (final validation)
    Mongo-->>BE: Not booked
    BE->>Mongo: push seats to bookedSeats
    BE->>Mongo: Create Booking document
    BE->>Redis: hDel(seat_lock:showId, A1)
    BE->>WS: emit("seat-booked", {seatId: A1})
    WS-->>UserB: seat-booked event
    Note over UserB: Seat A1 turns GREY (booked)
    BE-->>FE: 201 Created {booking}
    FE->>FE: Navigate to /booking-confirmation/:id
```

### 2. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant Redux as Redux Store
    participant BE as Backend API
    participant Mongo as MongoDB

    User->>FE: Enter email + password
    FE->>Redux: dispatch(loginUser(form))
    Redux->>BE: POST /api/auth/login
    BE->>Mongo: findOne({email})
    Mongo-->>BE: User document
    BE->>BE: bcrypt.compare(password, hash)
    alt Valid credentials
        BE->>BE: jwt.sign({id}, secret, {expiresIn: 7d})
        BE-->>Redux: {token, user}
        Redux->>Redux: Store in state + localStorage
        Redux-->>FE: Success
        FE->>FE: Navigate to Home
    else Invalid credentials
        BE-->>Redux: 401 "Invalid credentials"
        Redux-->>FE: Error
        FE->>FE: Show toast notification
    end
```

### 3. Payment Timer & Cancellation Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant BE as Backend API
    participant Redis as Redis

    User->>FE: Clicks "Initialize Payment"
    FE->>FE: Start 10-second countdown timer
    FE->>FE: Show progress bar + "Abort" button

    alt User clicks "Abort"
        FE->>FE: Clear timer
        loop For each selected seat
            FE->>BE: POST /shows/:id/unlock {seatId}
            BE->>Redis: hDel(seat_lock:showId, seatId)
        end
        FE->>FE: Clear selectedSeats state
        FE->>FE: Show "Payment Aborted" toast
    else Timer reaches 0
        FE->>BE: POST /bookings {showId, seats, totalAmount}
        BE-->>FE: 201 Booking created
        FE->>FE: Navigate to confirmation page
    end
```

---

## 📋 Activity Diagrams

### Complete Booking Workflow

```mermaid
flowchart TD
    A([User opens app]) --> B[Browse Movies on Home]
    B --> C{Filter by Genre?}
    C -->|Yes| D[Select Genre filter]
    C -->|No| E[View all movies]
    D --> E
    E --> F[Click on Movie Card]
    F --> G[View Movie Details]
    G --> H[Select Date from picker]
    H --> I[View available shows by theatre]
    I --> J{Shows available?}
    J -->|No| H
    J -->|Yes| K[Click show time slot]
    K --> L{User logged in?}
    L -->|No| M[Redirect to Login]
    M --> N[Enter credentials]
    N --> O{Valid?}
    O -->|No| P[Show error toast]
    P --> N
    O -->|Yes| K
    L -->|Yes| Q[Enter Seat Selection page]
    Q --> R[Click on available seat]
    R --> S{Seat free in Redis?}
    S -->|No| T[Show error: Seat locked]
    T --> R
    S -->|Yes| U[Lock seat in Redis 5min TTL]
    U --> V[Seat turns PURPLE on UI]
    V --> W{Select more seats?}
    W -->|Yes| R
    W -->|No| X[Click Initialize Payment]
    X --> Y[10-second countdown starts]
    Y --> Z{User clicks Abort?}
    Z -->|Yes| AA[Unlock all seats in Redis]
    AA --> AB[Clear selected seats]
    AB --> R
    Z -->|No| BB{Timer reaches 0?}
    BB -->|No| Y
    BB -->|Yes| CC[POST /bookings API call]
    CC --> DD[Write to MongoDB]
    DD --> EE[Clear Redis locks]
    EE --> FF[Emit seat-booked via Socket.IO]
    FF --> GG([Booking Confirmation Page])
```

### Admin Workflow

```mermaid
flowchart TD
    A([Admin logs in]) --> B[View Dashboard]
    B --> C{Choose action}
    C --> D[Manage Movies]
    C --> E[Manage Theatres]
    C --> F[Manage Shows]
    C --> G[View All Bookings]
    D --> D1[Add Movie]
    D --> D2[Edit Movie]
    D --> D3[Delete Movie - soft delete]
    E --> E1[Add Theatre with seat layout]
    E --> E2[Edit Theatre]
    E --> E3[Delete Theatre]
    F --> F1[Schedule Show: link Movie + Theatre + Date + Time]
    F --> F2[Set prices per category]
    F --> F3[Edit/Delete Show]
    G --> G1[View user name, movie, seats, amount, status]
```

---

## 📁 Project Structure

```
movie-booking/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive nav with admin link
│   │   │   ├── Footer.jsx           # Site footer
│   │   │   ├── MovieCard.jsx        # Movie poster card component
│   │   │   ├── SeatLayout.jsx       # Interactive seat grid (8x10)
│   │   │   └── Spinner.jsx          # Loading spinner
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero + movie grid with genre filter
│   │   │   ├── MovieDetails.jsx     # Movie info + date picker + shows
│   │   │   ├── BookingPage.jsx      # Seat selection + checkout + timer
│   │   │   ├── BookingConfirmation.jsx  # Ticket confirmation card
│   │   │   ├── MyBookings.jsx       # User's booking history
│   │   │   ├── Profile.jsx          # User profile editor
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── NotFound.jsx         # 404 page
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.jsx   # Stats + quick actions
│   │   │       ├── AdminMovies.jsx      # CRUD movies
│   │   │       ├── AdminTheatres.jsx    # CRUD theatres
│   │   │       ├── AdminShows.jsx       # Schedule shows
│   │   │       └── AdminBookings.jsx    # View all bookings
│   │   ├── redux/
│   │   │   ├── store.js             # Redux store config
│   │   │   └── slices/
│   │   │       └── authSlice.js     # Auth state (login/register/logout)
│   │   ├── utils/
│   │   │   ├── api.js               # Axios instance with JWT interceptor
│   │   │   └── socket.js            # Socket.IO client instance
│   │   ├── App.jsx                  # Routes + ProtectedRoute + AdminRoute
│   │   ├── main.jsx                 # Entry point (Redux Provider)
│   │   └── index.css                # Global styles + Tailwind
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Backend (Node.js + Express)
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt pre-save hook)
│   │   ├── Movie.js                 # Movie schema
│   │   ├── Theatre.js               # Theatre schema (seat layout)
│   │   ├── Show.js                  # Show schema (links movie + theatre)
│   │   └── Booking.js               # Booking schema (auto bookingId)
│   ├── routes/
│   │   ├── auth.js                  # Register, Login, Profile update
│   │   ├── movies.js                # CRUD movies (admin-protected)
│   │   ├── theatres.js              # CRUD theatres (admin-protected)
│   │   ├── shows.js                 # CRUD shows + Lock/Unlock endpoints
│   │   └── bookings.js              # Create/Cancel bookings + Redis cleanup
│   ├── middleware/
│   │   └── auth.js                  # JWT verify (protect) + adminOnly
│   ├── utils/
│   │   └── redisClient.js           # Redis connection manager
│   ├── server.js                    # Express + Socket.IO + MongoDB + Redis init
│   ├── package.json
│   └── .env
│
├── seed.js                          # Database seeder (movies, theatres, shows, users)
├── setup_guide.md
└── README.md
```

---

## ✨ Features Deep Dive

### 1. Movie Browsing & Filtering
- Home page displays all active movies in a responsive grid
- Genre filter bar (Action, Comedy, Drama, Horror, Thriller, Sci-Fi, etc.)
- Each `MovieCard` shows poster, title, duration, genre tags, language badges, and rating

### 2. Movie Details & Show Selection
- Cinematic hero banner with blurred poster background
- 7-day date picker to browse upcoming shows
- Shows grouped by theatre with available seat count
- Format badges (2D, 3D, IMAX) and "Sold Out" indicators

### 3. Real-Time Seat Selection
- 8×10 interactive seat grid divided into 3 categories (Recliner, Gold, Silver)
- **4 visual states:** Available (dark), Selected (purple glow), Locked (orange glow), Booked (grey)
- Clicking a seat calls the `/lock` API → Redis stores the lock → Socket.IO notifies all viewers
- Other users see your selected seats turn orange in real-time

### 4. Payment Timer (10-second countdown)
- After clicking "Initialize Payment", a 10-second countdown starts with a progress bar
- User can click "Abort" to cancel — which unlocks all selected seats in Redis
- If timer reaches 0, the booking is finalized in MongoDB

### 5. Booking Confirmation
- Digital ticket card with movie poster, theatre, date, time, seats, amount
- Auto-generated booking ID (format: `BMS{timestamp}{random}`)
- Links to "My Bookings" and "Home"

### 6. Booking Management
- Users can view all their bookings (confirmed + cancelled)
- Cancel button releases seats back (removes from `bookedSeats` array in MongoDB)
- Cancellation sets `paymentStatus: 'refunded'`

### 7. User Profile
- View/edit name and phone number
- Displays total booking count and account type
- Admin badge for admin users

### 8. Admin Panel
- **Dashboard:** Live stats (movies, theatres, shows, bookings, revenue) + recent bookings feed
- **Manage Movies:** Add/Edit/Delete (soft delete via `isActive` flag)
- **Manage Theatres:** Configure seat layouts with row categories and pricing
- **Manage Shows:** Link movie + theatre + date + time + format + language + pricing
- **View Bookings:** Master list of all bookings with user info

---

## 🌐 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Create new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | JWT | Get current user profile |
| PUT | `/update-profile` | JWT | Update name & phone |

### Movies (`/api/movies`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List movies (filter: search, genre, language) |
| GET | `/:id` | — | Get single movie |
| POST | `/` | Admin | Create movie |
| PUT | `/:id` | Admin | Update movie |
| DELETE | `/:id` | Admin | Soft delete movie |

### Theatres (`/api/theatres`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List theatres (filter: city) |
| GET | `/:id` | — | Get single theatre |
| POST | `/` | Admin | Create theatre |
| PUT | `/:id` | Admin | Update theatre |
| DELETE | `/:id` | Admin | Soft delete theatre |

### Shows (`/api/shows`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List shows (filter: movie, date, theatreId) |
| GET | `/:id` | — | Get show + lockedSeats from Redis |
| POST | `/:id/lock` | JWT | Lock a seat in Redis (5min TTL) |
| POST | `/:id/unlock` | JWT | Unlock your own seat in Redis |
| POST | `/` | Admin | Create show |
| PUT | `/:id` | Admin | Update show |
| DELETE | `/:id` | Admin | Soft delete show |

### Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Create booking (validates Redis locks, writes MongoDB) |
| GET | `/my` | JWT | Get current user's bookings |
| GET | `/:id` | JWT | Get single booking (owner or admin) |
| PUT | `/:id/cancel` | JWT | Cancel booking & release seats |
| GET | `/` | Admin | Get all bookings |

---

## 🔐 Real-Time Seat Locking (Redis + Socket.IO)

### Redis Data Design

```
Key:     seat_lock:{showId}
Type:    Hash
Fields:  seatId → userId
TTL:     300 seconds (5 minutes)

Example:
  seat_lock:665abc123def → { "A1": "user123", "A2": "user123", "B5": "user456" }
```

### Socket.IO Events

| Event | Direction | Payload | When |
|-------|-----------|---------|------|
| `join-show` | Client → Server | `showId` | User opens booking page |
| `seat-locked` | Server → Room | `{ seatId, userId }` | Seat locked in Redis |
| `seat-unlocked` | Server → Room | `{ seatId }` | Seat unlocked from Redis |
| `seat-booked` | Server → Room | `{ seatId }` | Seat permanently booked in MongoDB |

### Why This Architecture Prevents Double Bookings

1. **Redis acts as a distributed lock manager** — only one user can hold a lock per seat
2. **TTL auto-cleanup** — if a user abandons the page, locks expire in 5 minutes
3. **Socket.IO provides instant feedback** — other users see locks in real-time
4. **MongoDB final validation** — even if Redis fails, the booking endpoint re-checks `bookedSeats`

---

## 🖥 Frontend Architecture

### State Management

```
Redux Store
└── auth
    ├── user (from localStorage)
    ├── token (from localStorage)
    ├── loading
    └── error
```

All other state (movies, shows, bookings) is managed locally in components via `useState` + API calls.

### Route Protection

| Wrapper | Logic | Used For |
|---------|-------|----------|
| `ProtectedRoute` | Redirects to `/login` if no user | Booking, Profile, My Bookings |
| `AdminRoute` | Redirects to `/login` if no user, `/` if not admin | All `/admin/*` routes |

### Axios Interceptors

- **Request:** Automatically attaches `Authorization: Bearer <token>` header
- **Response:** On 401 error, clears localStorage and redirects to `/login`

---

## 🔑 Authentication & Authorization

### Password Security
- Passwords are hashed using **bcryptjs** with **12 salt rounds** via a Mongoose `pre('save')` hook
- Raw passwords are never stored in the database

### JWT Tokens
- Signed with `JWT_SECRET` environment variable
- Default expiry: **7 days**
- Stored in `localStorage` on the client
- Verified on every protected API call via the `protect` middleware

### Role-Based Access
- `user` role: Can browse, book, cancel, and manage their own profile
- `admin` role: Full CRUD on movies, theatres, shows + view all bookings + dashboard

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18+
- **MongoDB** running on `localhost:27017`
- **Redis** running on `localhost:6379`

### Step 1: Clone & Install

```bash
git clone <repo-url>
cd movie-booking

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Step 2: Configure Environment

```bash
# In server/.env
PORT=5001
MONGO_URI=mongodb://localhost:27017/movie-booking
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

### Step 3: Seed Database

```bash
cd movie-booking
node seed.js
```

### Step 4: Start Services

```bash
# Terminal 1 — Start Redis
brew services start redis

# Terminal 2 — Start Backend
cd server && npm run dev

# Terminal 3 — Start Frontend
cd client && npm run dev
```

Visit **http://localhost:5173**

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@bookmyshow.com` | `admin123` |
| User | `user@bookmyshow.com` | `user123` |

---

## 📄 License

This project is for educational and portfolio purposes.

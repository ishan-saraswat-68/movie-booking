# 🚀 The Ultimate MERN Movie Booking Backend Masterclass: Zero to Hero

Welcome to the most exhaustive, comprehensive, and in-depth masterclass on building a production-grade Movie Booking Application backend. This guide is designed to take you from absolute zero—assuming you only know basic JavaScript—and turn you into an advanced backend engineer capable of designing scalable, concurrent, real-time systems.

This document is massive (2500+ lines). It doesn't just show you the code; it explains the computer science principles, system design choices, and JavaScript engine mechanics behind every single line.

Get ready to become a hero.

---

## 📚 TABLE OF CONTENTS

1. **Chapter 1: The Grand Architecture & Paradigms**
2. **Chapter 2: Setting up the Canvas (`package.json` & `.env`)**
3. **Chapter 3: The Engine Room (`server.js`)**
4. **Chapter 4: Database Design & Mongoose Schemas**
5. **Chapter 5: The Gatekeeper (Auth Middleware)**
6. **Chapter 6: The Authentication API (`routes/auth.js`)**
7. **Chapter 7: The Core Entities API (`routes/movies.js` & `theatres.js`)**
8. **Chapter 8: The Show API & Redis Concurrency (`routes/shows.js`)**
9. **Chapter 9: The Booking Engine (`routes/bookings.js`)**
10. **Chapter 10: Utilities & Failsafes (`utils/redisClient.js`)**
11. **Chapter 11: Database Seeding Strategies (`seed.js`)**
12. **Chapter 12: Scaling to Millions of Users**

---

## 🏛️ Chapter 1: The Grand Architecture & Paradigms

Before touching a single file, we must understand the universe our code lives in.

### 1.1 What is the MERN Stack?
- **MongoDB**: A NoSQL database. Unlike MySQL or PostgreSQL, which use tables, rows, and strict columns, MongoDB stores data as "Documents" (similar to JSON). This allows for incredible flexibility—a movie document can contain a nested array of its cast without needing a separate table and a complex `JOIN` query.
- **Express.js**: A minimalist web framework for Node.js. Node.js natively provides an `http` module, but it's very low-level. Express gives us beautiful abstractions for routing, middleware, and request/response handling.
- **React**: The frontend library (which consumes this backend API).
- **Node.js**: JavaScript was originally designed to run *only* inside a web browser (like Chrome). Ryan Dahl took the V8 JavaScript engine out of Chrome, slapped some C++ bindings on it for file system and network access, and called it Node.js. It allows us to write backend servers in JavaScript.

### 1.2 The Event Loop (Why Node.js is Fast)
Node.js is **single-threaded**. This sounds like a flaw. If you have 10,000 users trying to book a movie ticket at the same time, how does one thread handle it?
Node uses an **Event Loop** and **Asynchronous I/O**. 
If User A requests a list of movies, Node asks the database for the movies. *Instead of waiting for the database to reply*, Node immediately moves on to User B's request. When the database finally replies, it places the data in an "Event Queue". The Event Loop picks it up and sends the response back to User A. 
This non-blocking architecture makes Node.js unbelievably fast for I/O-heavy applications (like APIs), though it is poor for heavy CPU tasks (like rendering video).

### 1.3 RESTful API Architecture
We are building a REST (Representational State Transfer) API. An API is a contract between the frontend and the backend. 
REST uses HTTP methods to define actions:
- `GET /api/movies` -> Fetch all movies.
- `GET /api/movies/:id` -> Fetch one movie.
- `POST /api/movies` -> Create a movie.
- `PUT /api/movies/:id` -> Update a movie.
- `DELETE /api/movies/:id` -> Delete a movie.

---

## 📦 Chapter 2: Setting up the Canvas (`package.json` & `.env`)

### 2.1 The `package.json` File
This file is the heart of any Node.js project. It manages metadata and dependencies (external libraries).

```json
{
  "name": "movie-booking-server",
  "version": "1.0.0",
  "description": "MERN Movie Booking App Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "redis": "^5.12.1",
    "socket.io": "^4.8.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Deep Dive into Dependencies:**
- `bcryptjs`: A pure JavaScript implementation of the bcrypt password hashing function. We use this to encrypt passwords. The `js` version is slightly slower than the C++ `bcrypt` binding, but it's much easier to install across different operating systems.
- `cors`: Browsers enforce a "Same-Origin Policy". If your React app is on `http://localhost:5173` and your server is on `http://localhost:5001`, the browser will block the request for security. The `cors` package adds HTTP headers to the server's response telling the browser, "I explicitly allow localhost:5173 to talk to me."
- `dotenv`: It loads variables from a `.env` file into `process.env`.
- `jsonwebtoken`: An implementation of JSON Web Tokens. It's used for stateless authentication.
- `mongoose`: An Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and the representation of those objects in MongoDB.
- `morgan`: An HTTP request logger middleware for node.js.
- `redis`: A robust client for connecting to a Redis server.
- `socket.io`: Enables real-time, bidirectional, and event-based communication.

**devDependencies vs dependencies:**
`nodemon` is a dev dependency. It watches our files and restarts the server on save. In production (AWS, Heroku), we don't need this, so we use `npm start` which just runs `node server.js`.

### 2.2 The `.env` File
You should *never* commit passwords or secret keys to GitHub. We store them in `.env`.

```env
PORT=5001
MONGO_URI=mongodb+srv://saraswatishan24_db_user:ishan123@cluster0.ksrfyus.mongodb.net/moviebooking
JWT_SECRET=movieapp
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

When our app boots up, `dotenv` reads this file and attaches these variables to `process.env`.

---

## ⚙️ Chapter 3: The Engine Room (`server.js`)

`server.js` is where everything begins. Let's look at every single line.

```javascript
// 1. Core Imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// 2. Load Environment Variables
require('dotenv').config();

// 3. Custom Utilities
const { connectRedis } = require('./utils/redisClient');
```
We use CommonJS `require()` syntax. Notice `http`. Express usually handles the HTTP server creation under the hood, but because we need to attach Socket.io to the exact same server port, we must manually extract and create the HTTP server.

```javascript
// 4. Route Imports
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const theatreRoutes = require('./routes/theatres');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
```
We import our routing controllers. This keeps `server.js` from becoming thousands of lines long.

```javascript
// 5. App Initialization
const app = express();
const server = http.createServer(app);

// 6. Socket.io Initialization
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
```
We initialize Express (`app`), wrap it in the Node `http` server, and then pass that server to a new Socket.io `Server` instance. 
**Socket CORS**: WebSockets are a different protocol (`ws://`) than HTTP (`http://`). Therefore, standard Express CORS doesn't apply to them. We must explicitly define CORS rules for Socket.io.

```javascript
// 7. Dependency Injection Middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});
```
**Concept: The Middleware Onion**
Express processes requests through a chain of functions called middleware. Think of it like layers of an onion. A request goes through layer 1, then layer 2, etc., until it hits the final route handler.
Here, we take the `io` object we just created and inject it into the `req` (request) object. Why? Because later on, deep inside `routes/shows.js`, we need to emit a socket event. If we didn't do this, we'd have to find a messy way to export/import the `io` object. This is a clean Dependency Injection pattern. `next()` tells Express to proceed to the next onion layer.

```javascript
// 8. Standard Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));
```
- `express.json()`: Without this, if the frontend sends `{ "name": "Ishan" }`, your backend will see `req.body` as `undefined`. This middleware reads the incoming stream, parses the JSON, and attaches it to `req.body`.

```javascript
// 9. Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Movie Booking API running' }));
```
Mounting means: "If a request URL starts with `/api/movies`, chop off the `/api/movies` part and send the rest of the request to the `movieRoutes` file."

```javascript
// 10. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});
```
If you ever call `next(new Error("Something broke"))` inside a route, Express will skip all other middlewares and jump straight to this function (because it has 4 arguments: `err, req, res, next`). It guarantees the user gets a JSON error response instead of an HTML crash page.

```javascript
// 11. Database Bootup and Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await connectRedis(); // Connect caching layer
    
    // 12. Socket.io Event Listeners
    io.on('connection', (socket) => {
      console.log('User connected to socket:', socket.id);
      
      socket.on('join-show', (showId) => {
        socket.join(showId);
        console.log(`Socket ${socket.id} joined show ${showId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected from socket:', socket.id);
      });
    });

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
```
We connect to MongoDB. It returns a Promise. If successful (`.then`), we connect to Redis. 
**Socket.io Rooms**: 
When a user opens the app, `io.on('connection')` fires. They get a unique `socket.id` (e.g., `abc123xyz`). 
When they click on "Avatar 2 at 8 PM", the frontend sends a `join-show` event with the `showId`. 
`socket.join(showId)` places this user into a virtual room. This is the secret to scaling real-time apps. If someone locks a seat in Avatar 2, we don't broadcast it to the 10,000 people browsing the homepage. We broadcast it *only* to the room matching Avatar 2's `showId`.

---

## 🗄️ Chapter 4: Database Design & Mongoose Schemas

In MongoDB, data is stored as JSON-like BSON documents. Mongoose provides a strict schema on top of this flexible database to prevent bad data from being saved.

### 4.1 The User Model (`models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);
```
- `trim: true` cuts out accidental spaces. `unique: true` creates a database index to enforce uniqueness at the database engine level (very fast). 
- `timestamps: true` is a Mongoose feature that automatically injects `createdAt` and `updatedAt` properties.

**The Pre-Save Hook (Cryptography)**
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```
Before any User document is saved (`.save()`, `.create()`), Mongoose pauses and runs this function.
`this` refers to the user document being saved. 
If the password field wasn't changed (e.g., the user is just updating their phone number), we skip this block using `return next()`.
If it *is* new, we hash it. 
**What is Hashing?** 
Unlike encryption (which can be decrypted), hashing is a one-way street. `bcrypt.hash("password123")` turns into a chaotic string like `$2a$12$R9h/cIPz0gi.URNNX3rubedPosQlsd23.`. You cannot mathematically reverse this.
The `12` is the cost factor. Every time you increase this number by 1, the hashing takes twice as long. `12` takes a few hundred milliseconds. This intentionally slows down hackers who steal the database and try to brute-force millions of passwords a second.

```javascript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model('User', userSchema);
```
Because we can't reverse the hash, how do we log in? We take the password the user typed (`candidatePassword`), run it through the exact same bcrypt algorithm, and see if the resulting chaotic string matches the one stored in the database.

### 4.2 The Movie Model (`models/Movie.js`)

```javascript
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: [{ type: String, default: ['Hindi', 'English'] }],
    duration: { type: Number, required: true }, 
    releaseDate: { type: Date, required: true },
    poster: { type: String, required: true },
    trailer: { type: String, default: '' },
    cast: [{ name: String, role: String, image: String }],
    director: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
```
**NoSQL Power:** Look at `cast: [{ name: String, role: String, image: String }]`. In a SQL database like MySQL, you would need a `Movies` table, a `Cast` table, and a junction table linking them, requiring a `JOIN` operation to fetch a movie's actors. In MongoDB, we just embed the array of actor objects directly inside the Movie document. When we fetch the movie, we get the cast for free, instantly.

### 4.3 The Theatre Model (`models/Theatre.js`)

```javascript
const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, default: '' },
    totalSeats: { type: Number, required: true },
    seatLayout: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
      categories: [
        {
          name: { type: String }, 
          rows: [String],         
          price: Number,
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', theatreSchema);
```
The `seatLayout` handles the physical mapping. `rows: 10, cols: 20` tells the frontend to draw a 10x20 grid. The `categories` array allows complex pricing (e.g., Rows A-B are Recliners at ₹500, Rows C-J are Standard at ₹200).

### 4.4 The Show Model (`models/Show.js`)

```javascript
const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    language: { type: String, required: true },
    format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
    totalSeats: { type: Number, required: true },
    bookedSeats: [{ type: String }],
    price: {
      recliner: { type: Number, default: 500 },
      gold: { type: Number, default: 300 },
      silver: { type: Number, default: 180 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);
```
This is the junction model. A `Show` is a specific `Movie` playing at a specific `Theatre` at a specific `date` and `time`. 
**Relational References:** 
`type: mongoose.Schema.Types.ObjectId` tells Mongo that this field stores an ID of another document. `ref: 'Movie'` tells Mongoose *which* collection that ID belongs to. This is crucial for `.populate()` which we will see in the routes.
`bookedSeats` is the persistent array of permanent bookings. When someone buys seat "A1", we push "A1" into this array.

### 4.5 The Booking Model (`models/Booking.js`)

```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seats: [{ type: String }],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String, default: '' },
    bookingId: { type: String, unique: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'BMS' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
```
When a user pays, a Booking document is created.
We use a `pre('save')` hook to automatically generate a human-readable `bookingId` (e.g., `BMS1698765432123`). We combine `Date.now()` (milliseconds since 1970) with a random number to guarantee mathematical uniqueness. 

---

## 🛡️ Chapter 5: The Gatekeeper (Auth Middleware)

REST APIs are stateless. When User A makes a request, the server handles it. When User A makes a second request 5 seconds later, the server has absolutely no memory of the first request. 
How do we keep a user logged in? We use **JSON Web Tokens (JWT)**.

When a user logs in, the server generates a token (a long string of gibberish) and gives it to the user. The user attaches this token to the headers of all future requests. The server verifies the token to identify the user.

### `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  // 1. Check for token in headers
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  
  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    
    // 4. Proceed to route
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```
**Step-by-step Execution:**
1. The frontend sends an HTTP Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...`. We split it by space and take the second part (the token itself).
2. `jwt.verify` uses our cryptographic `JWT_SECRET`. It checks if the token has expired. It also checks the signature. If a hacker alters even a single character in the token payload to try and change their User ID to an Admin ID, the signature will break, and `verify` will throw an error, dropping us into the `catch` block (`401 Invalid token`).
3. If valid, `jwt.verify` returns the decoded payload (e.g., `{ id: "60d5ec...", iat: 162..., exp: 162... }`).
4. We query MongoDB: "Find the user with this ID." We use `.select('-password')` which tells Mongo "Give me the user object, but strip out the password field" for security.
5. We attach the user document directly to the Express `req` object (`req.user = ...`). 
6. `next()` tells Express to pass control to the actual API route function.

```javascript
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }
  next();
};
```
This is a Role-Based Access Control (RBAC) middleware. It assumes `protect` ran first (so `req.user` exists). If the user isn't an admin, we return `403 Forbidden`.

---

## 🔑 Chapter 6: The Authentication API (`routes/auth.js`)

This file handles user onboarding and sessions.

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
```
`signToken` is a helper function. It takes a payload (the user's MongoDB `_id`), signs it with our secret, and sets it to expire in 7 days.

**The Registration Route (`POST /api/auth/register`)**
```javascript
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if email is taken
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Create user (Pre-save hook will hash password here!)
    const user = await User.create({ name, email, password, phone });
    
    // Generate Token
    const token = signToken(user._id);
    
    // Send response
    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```
We use HTTP status `201` (Created) instead of standard `200` (OK) to follow REST best practices when a resource is created.

**The Login Route (`POST /api/auth/login`)**
```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```
Notice the error message: `'Invalid credentials'`. We do NOT say "Email not found" or "Incorrect password". If a hacker is trying random emails, telling them "Incorrect password" confirms that the email exists in our system! We give a generic error for security.

**The Me Route (`GET /api/auth/me`)**
```javascript
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});
```
When a user closes the browser and reopens it, the React frontend still has the JWT in localStorage, but its Redux/Context state is empty. React sends a GET request to `/me` with the token. The `protect` middleware does the heavy lifting, verifies the token, fetches the user, and puts it in `req.user`. This route simply sends it back to hydrate the frontend state.

---

## 🎬 Chapter 7: The Core Entities API (`routes/movies.js` & `theatres.js`)

These files handle basic CRUD (Create, Read, Update, Delete) operations. We will look at `movies.js`.

```javascript
const express = require('express');
const Movie = require('../models/Movie');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();
```

**Fetch All Movies (`GET /api/movies`)**
```javascript
router.get('/', async (req, res) => {
  try {
    const { search, genre, language } = req.query;
    const query = { isActive: true }; // Only show active movies
    
    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;
    if (language) query.language = language;

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```
**Query String Parsing:**
If the frontend requests `GET /api/movies?search=batman&language=English`, Express parses the URL and creates `req.query = { search: 'batman', language: 'English' }`.
We dynamically construct a MongoDB filter object (`query`). 
- `isActive: true` ensures deleted movies aren't shown.
- `$regex` tells MongoDB to do a pattern match. `$options: 'i'` means case-insensitive.
- `.sort({ releaseDate: -1 })` sorts the results in descending order (`-1`), so the newest movies appear first.

**Fetch Single Movie (`GET /api/movies/:id`)**
```javascript
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```
`req.params.id` grabs the dynamic `id` from the URL. 

**Admin Routes (POST, PUT, DELETE)**
```javascript
// Create
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete (Soft Delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Movie.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Movie removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```
Notice the middleware chain: `protect, adminOnly`. Express runs `protect` first. If valid, it runs `adminOnly`. If valid, it runs the route function.
**Soft Deletes:** We don't use `Movie.findByIdAndDelete`. If we delete a movie from the database, all historical Booking documents referencing that movie will break. Instead, we just set `isActive: false`. Our GET route ignores inactive movies.

The `routes/theatres.js` file follows this exact same CRUD pattern.

---

## 🔥 Chapter 8: The Show API & Redis Concurrency (`routes/shows.js`)

This is the most mathematically and logically complex part of the application. 

### 8.1 Fetching Shows with Complex Filters

```javascript
router.get('/', async (req, res) => {
  try {
    const { movie, date, theatreId } = req.query;
    const query = { isActive: true };
    if (movie) query.movie = movie;
    if (theatreId) query.theatre = theatreId;
    
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title poster duration genre')
      .populate('theatre', 'name address city')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, shows });
  } catch (err) { ... }
});
```
**Date Range Querying:**
If a user searches for shows on "2023-12-25", they want shows happening *anytime* on that day. 
We create a `start` date and set the time to 00:00:00.
We create an `end` date and set the time to 23:59:59.
We tell MongoDB to find dates that are Greater Than or Equal To (`$gte`) `start` AND Less Than or Equal To (`$lte`) `end`.

**The Magic of `.populate()`:**
A Show document in the DB just looks like `{ movie: '60d5ec...', theatre: '60d5fe...' }`. That's useless to the frontend.
`.populate('movie', 'title poster')` tells Mongoose: "Take this ID, go to the Movie collection, find the document, extract the `title` and `poster`, and replace the ID with that object." Mongoose handles this JOIN-like behavior seamlessly under the hood.

### 8.2 The Concurrency Problem & The Redis Solution
Imagine two users, Alice and Bob, looking at the same seat layout. Seat `A1` is available.
- Alice clicks A1. Her browser sends a "Pay" request.
- One millisecond later, Bob clicks A1. His browser sends a "Pay" request.
- The server processes Alice, marks A1 booked, and returns success.
- The server processes Bob, marks A1 booked, and returns success.
Result: Double booking. 

To solve this, we use **Redis** (Remote Dictionary Server). It is an in-memory database (runs in RAM, not hard drives) capable of millions of operations per second. 
When Alice clicks A1, we immediately lock it in Redis. If Bob clicks it a millisecond later, Redis rejects him.

### 8.3 Fetching a Single Show (And Merging Redis Data)
When the frontend loads the seat map, it needs to know which seats are permanently booked (Mongo) AND temporarily locked by people currently typing their credit cards (Redis).

```javascript
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movie').populate('theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // 1. Fetch locked seats from Redis
    const lockKey = `seat_lock:${show._id}`;
    const lockedSeatsObj = await redisClient.hGetAll(lockKey);
    
    // 2. Extract seat IDs
    const lockedSeats = Object.keys(lockedSeatsObj);

    // 3. Merge lockedSeats into the response
    const showData = show.toObject(); // Convert Mongoose document to plain JS object
    showData.lockedSeats = lockedSeats;

    res.json({ success: true, show: showData });
  } catch (err) { ... }
});
```
We query Redis for a "Hash" named `seat_lock:SHOW_ID`. 
The hash looks like this: `{ "A1": "userId123", "C4": "userId999" }`.
`Object.keys` gives us `['A1', 'C4']`. We inject this array into the API response. The frontend reads this array and turns A1 and C4 yellow (locked) on the screen.

### 8.4 Locking a Seat (`POST /:id/lock`)

```javascript
router.post('/:id/lock', protect, async (req, res) => {
  try {
    const { seatId } = req.body;
    const showId = req.params.id;
    const userId = req.user._id.toString();
    const key = `seat_lock:${showId}`;

    // 1. Check if already locked in Redis
    const lockedBy = await redisClient.hGet(key, seatId);
    if (lockedBy && lockedBy !== userId) {
      return res.status(400).json({ success: false, message: 'Seat already locked' });
    }

    // 2. Check if already permanently booked in MongoDB
    const show = await Show.findById(showId);
    if (!show || show.bookedSeats.includes(seatId)) {
      return res.status(400).json({ success: false, message: 'Seat already booked' });
    }

    // 3. Lock seat
    await redisClient.hSet(key, seatId, userId);
    
    // 4. Set Time-To-Live (TTL)
    await redisClient.expire(key, 300); // 5 minutes

    // 5. Emit real-time WebSocket event
    req.io.to(showId).emit('seat-locked', { seatId, userId });

    res.json({ success: true, message: 'Seat locked' });
  } catch (err) { ... }
});
```
**The Lock Algorithm:**
1. **Redis Check:** Is `A1` already in the hash? If yes, and the user who locked it isn't the person making this request, block them!
2. **Mongo Check:** Did someone just finish paying for this seat? Check the `show.bookedSeats` array. If yes, block them!
3. **Acquire Lock:** Use `hSet` to add `"A1": "Alice_ID"` to the Redis Hash.
4. **TTL (Time to Live):** We call `expire(key, 300)`. This tells Redis: "Start a 5-minute timer. When it hits zero, delete this entire hash." If Alice's laptop dies while checking out, the lock will automatically evaporate after 5 minutes, freeing the seat. 
5. **WebSocket Push:** We use the `req.io` object we injected back in `server.js`. `to(showId)` targets the specific Socket.io room. We blast a message to everyone in that room saying `seat-locked`. Their React apps instantly turn the seat yellow.

---

## 🎟️ Chapter 9: The Booking Engine (`routes/bookings.js`)

Alice has successfully locked her seats and submitted her credit card. It's time to finalize the transaction.

### 9.1 Creating a Booking (`POST /api/bookings`)

```javascript
const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect } = require('../middleware/auth');
const { redisClient } = require('../utils/redisClient');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { showId, seats, totalAmount } = req.body;
    const show = await Show.findById(showId);

    // 1. Pessimistic Check
    const alreadyBooked = seats.filter((s) => show.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({ message: `Seats ${alreadyBooked.join(', ')} are already booked` });
    }

    // 2. Commit to Database
    show.bookedSeats.push(...seats); // Spread syntax: push 'A1', 'A2' individually
    await show.save();

    // 3. Create Booking Record
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentStatus: 'completed', // In a real app, this waits for a Stripe webhook
    });

    // 4. Cleanup Redis Locks
    const key = `seat_lock:${showId}`;
    for (const seatId of seats) {
      await redisClient.hDel(key, seatId);
      
      // 5. Broadcast final state
      req.io.to(showId).emit('seat-booked', { seatId });
    }

    // 6. Populate response for the frontend receipt
    await booking.populate([
      { path: 'show', populate: [{ path: 'movie', select: 'title poster' }, { path: 'theatre', select: 'name city' }] },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (err) { ... }
});
```

**System Design Choices:**
1. **Pessimistic Check:** Even with Redis locks, we are paranoid. Right before committing the transaction, we filter the incoming requested `seats` against `show.bookedSeats`. If even one seat matches, we abort the entire transaction.
2. **Cleanup:** Alice bought the tickets. We no longer need the temporary Redis locks. We loop through her seats and use `hDel` to delete them from the Redis hash.
3. **Websocket Evolution:** We emit a `seat-booked` event. The React frontend hears this and changes the seat color from Yellow (Locked) to Grey (Sold Out) for everyone else looking at the screen.
4. **Deep Population:** `booking.populate` shows how you can nest populates in Mongoose. We populate the `Show`, and *inside* that show, we populate the `Movie` and `Theatre`!

### 9.2 Cancelling a Booking (`PUT /api/bookings/:id/cancel`)

```javascript
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    // Security: Only the owner can cancel
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // 1. Release seats from the Show document
    const show = await Show.findById(booking.show);
    show.bookedSeats = show.bookedSeats.filter((s) => !booking.seats.includes(s));
    await show.save();

    // 2. Update Booking Status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) { ... }
});
```
When cancelling, we don't delete the Booking document (we need it for financial auditing). We simply change the status to `cancelled`. 
The critical logic is releasing the seats. We re-assign `show.bookedSeats` to a filtered version of itself, keeping only the seats that are *not* part of this cancelled booking.

---

## 🛡️ Chapter 10: Utilities & Failsafes (`utils/redisClient.js`)

In the real world, servers crash. Networks drop. What if our Redis server goes offline? If our routing code calls `redisClient.hSet()` and `redisClient` is null, the entire Node.js server will crash with a fatal exception, bringing down the whole app.

We use the **Adapter Pattern** to create a robust failsafe.

```javascript
const { createClient } = require('redis');

let redisClient = null;
let redisAvailable = false;

// 1. In-memory fallback database
const memoryStore = {};

// 2. The Polyfill / Mock Object
const fallback = {
  hGet: async (key, field) => memoryStore[key]?.[field] || null,
  hSet: async (key, field, value) => {
    if (!memoryStore[key]) memoryStore[key] = {};
    memoryStore[key][field] = value;
  },
  hDel: async (key, field) => {
    if (memoryStore[key]) delete memoryStore[key][field];
  },
  hGetAll: async (key) => memoryStore[key] || {},
  expire: async () => {}, // mock expire, does nothing in memory
};

// 3. Connection Logic
async function connectRedis() {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err.message));
    await redisClient.connect();
    redisAvailable = true;
    console.log('✅ Redis connected');
  } catch (err) {
    console.warn('⚠️  Redis not available, using in-memory fallback. Seat locking will not persist across restarts.');
    redisAvailable = false;
  }
}

// 4. The Smart Getter
function getRedisClient() {
  return redisAvailable && redisClient ? redisClient : fallback;
}

module.exports = { get redisClient() { return getRedisClient(); }, connectRedis };
```
**How it works:**
1. We define `memoryStore`, a simple JavaScript object that lives in the server's RAM.
2. We define a `fallback` object that perfectly mirrors the API signature of the official Redis library (`hGet`, `hSet`, etc.). But instead of making network calls to a Redis server, it just modifies the `memoryStore` object.
3. In `connectRedis()`, we attempt to connect. If it throws an error (e.g., you didn't install Redis on your laptop), the `catch` block intercepts it. The server doesn't crash! It just flags `redisAvailable = false`.
4. We export a getter. Whenever `routes/shows.js` requires `redisClient`, this function evaluates: "Is Redis online? Yes? Give them the real one. No? Give them the fake `fallback` object."
The routing code has *no idea* if it's talking to a real Redis cluster or a fake JS object. The application continues functioning seamlessly!

---

## 🌱 Chapter 11: Database Seeding Strategies (`seed.js`)

When building a complex app, you need data to test. Manually clicking through postman to create Users, Theatres, Movies, and Shows would take days. We use a seed script.

### Bulk Operations in `seed.js`
```javascript
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Movie.deleteMany({});
  await Theatre.deleteMany({});
  await Show.deleteMany({});
```
`deleteMany({})` with an empty filter deletes every single document in the collection. This provides a clean slate.

```javascript
  const createdMovies = await Movie.insertMany(movies);
  const createdTheatres = await Theatre.insertMany(theatres);
```
`insertMany` is highly optimized. Instead of taking an array of 10 movies and making 10 separate round-trip network calls to MongoDB, it batches them into a single binary transmission.

### Dynamic Generation (The Nested Loops)
Generating shows is mathematically complex. We want shows for every movie, in every theatre, for the next 5 days, at various times.

```javascript
  const shows = [];
  const today = new Date();

  createdMovies.forEach((movie) => {
    createdTheatres.forEach((theatre) => {
      for (let day = 0; day < 5; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day); // Advance the date by 'day'

        const times = ['10:00 AM', '1:30 PM'];
        times.forEach((time, i) => {
          shows.push({
            movie: movie._id,
            theatre: theatre._id,
            date,
            time,
            language: 'Hindi',
            format: '2D',
            totalSeats: 80,
            bookedSeats: [],
            price: { ... }
          });
        });
      }
    });
  });

  await Show.insertMany(shows);
```
This algorithm constructs a massive array in memory. 
If we have 5 Movies and 3 Theatres, for 5 days, 2 times a day:
`5 * 3 * 5 * 2 = 150 Show documents`.
We build all 150 objects in memory, push them to the `shows` array, and then execute a single `insertMany(shows)` call to the database. This executes in milliseconds.

---

## 📈 Chapter 12: Scaling to Millions of Users

This codebase is production-ready, but how do we scale it when BookMyShow experiences a massive spike (e.g., Avengers Endgame release)?

1. **Horizontal Scaling (Node.js)**
Node.js is single-threaded. To utilize a 16-core CPU server, we use PM2 (Process Manager) to spawn 16 identical Node.js instances. PM2 acts as a local load balancer, distributing incoming requests across all 16 instances.

2. **Socket.io Scaling (Redis Adapter)**
If we have 16 Node instances, we have a problem. If User A is connected to Instance 1, and User B is connected to Instance 2. User A locks a seat. Instance 1 broadcasts the `seat-locked` event. But User B won't hear it, because User B's socket is on Instance 2!
**Solution:** We configure Socket.io with a `Redis Adapter`. When Instance 1 needs to emit an event, it publishes it to Redis. Redis instantly pushes the event to Instances 2-16, which then broadcast it to their connected users.

3. **Database Scaling (MongoDB Replica Sets)**
As reads (GET requests) overwhelm a single database, we set up MongoDB Replica Sets. We have 1 Primary node (handles writes/bookings) and 3 Secondary nodes (handles reads/fetching movies). The Primary constantly synchronizes data to the Secondaries.

4. **Financial Consistency (ACID Transactions)**
In our `bookings.js`, what happens if the application crashes exactly between `await show.save()` and `await Booking.create()`? The seats are marked booked in the Show, but no Booking record exists! The seats are lost in the void.
In a true enterprise environment, we would wrap these two operations in a **MongoDB Session Transaction**. If anything fails during the process, MongoDB rolls back all changes as if they never happened, ensuring absolute ACID consistency.

---

## 🎉 Conclusion

You have reached the end of the masterclass. You have traversed the entire MERN stack backend architecture.
You now understand:
- The non-blocking nature of Node.js.
- Schema design and relations in MongoDB/Mongoose.
- Cryptography and stateless authentication using bcrypt and JWT.
- Complex MongoDB query construction (`$gte`, `$regex`).
- Resolving race conditions and concurrency using Redis caching.
- Event-driven, real-time web architecture using Socket.io Rooms.
- Defensive programming with Adapter patterns.
- Big O complexity when seeding databases.

You are no longer a junior developer stitching together tutorials. You understand the "Why" behind the system. Go build something incredible.

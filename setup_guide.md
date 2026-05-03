# 🚀 Project Setup & MongoDB Guide

> [!IMPORTANT]
> **UPDATE:** I have already performed the MongoDB installation and setup for you. MongoDB is now running locally on your Mac, and the database has been seeded with sample data.

---

## 1. Environment Variables Setup

The environment variables are stored in `server/.env`. I have already updated the port to `5001` to avoid conflicts and set the `MONGO_URI` to use your local MongoDB.

### Current Settings:
- `PORT`: `5001`
- `MONGO_URI`: `mongodb://127.0.0.1:27017/moviebooking`
- `JWT_SECRET`: `your_super_secret_jwt_key_here`
- `CLIENT_URL`: `http://localhost:5173`

---

## 2. MongoDB Setup on macOS (Done ✅)

I have installed and started MongoDB Community Edition for you.

### What I did:
1. **Installed MongoDB** via Homebrew (`mongodb-community@7.0`).
2. **Started the service**: MongoDB is now running in the background.
3. **Verified connection**: The database is listening on `127.0.0.1:27017`.

*If you ever need to restart it:* `brew services restart mongodb-community`

---

## 3. Seeded the Database (Done ✅)

I have already populated the database with initial movies, theatres, and shows.

1. **Seed script**: `node seed.js` has been executed successfully.
2. **Sample Data**: 8 movies, 3 theatres, and 240 shows are now in your database.

---

## 4. Run the Application

You can now start the app easily:

### Option A: Run everything together (Recommended)
From the **root directory**:
```bash
npm run dev
```

### Option B: Run separately
1. **Start Backend:**
   ```bash
   npm run server
   ```
   *The server runs on [http://localhost:5001](http://localhost:5001)*

2. **Start Frontend:**
   ```bash
   npm run client
   ```
   *The app runs on [http://localhost:5173](http://localhost:5173)*

---

## 👤 Login Credentials (Seeded)

- **Admin:** `admin@bookmyshow.com` / `admin123`
- **User:** `user@bookmyshow.com` / `user123`

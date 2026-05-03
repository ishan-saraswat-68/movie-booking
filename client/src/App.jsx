import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import BookingPage from './pages/BookingPage';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminTheatres from './pages/Admin/AdminTheatres';
import AdminShows from './pages/Admin/AdminShows';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminBookings from './pages/Admin/AdminBookings';

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111827', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/booking/:showId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/movies" element={<AdminRoute><AdminMovies /></AdminRoute>} />
          <Route path="/admin/theatres" element={<AdminRoute><AdminTheatres /></AdminRoute>} />
          <Route path="/admin/shows" element={<AdminRoute><AdminShows /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

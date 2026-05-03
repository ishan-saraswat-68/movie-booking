import { Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <FaFilm className="text-primary text-6xl mb-6" />
      <h1 className="text-8xl font-black text-white mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-3">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md">
        Looks like this page took a break. Let's get you back to the movies.
      </p>
      <Link to="/" className="btn-primary px-8 py-3 text-lg">Go Home</Link>
    </div>
  );
}

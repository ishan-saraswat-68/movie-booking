/**
 * Seed Script — populates DB with sample data
 * Usage: node server/seed.js
 */

const mongoose = require('./server/node_modules/mongoose');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const User = require('./server/models/User');
const Movie = require('./server/models/Movie');
const Theatre = require('./server/models/Theatre');
const Show = require('./server/models/Show');

const movies = [
  {
    title: 'Animal',
    description: 'A son\'s unconditional love for his father takes a dark turn, triggering a storm of vengeance and violence.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: ['Hindi', 'Telugu', 'Tamil'],
    duration: 201,
    releaseDate: new Date('2023-12-01'),
    poster: 'https://m.media-amazon.com/images/M/MV5BZThmNDg1NjUtNWJhMC00YjA3LWJiMjItNmM4ZDQ5ZGZiN2Y2XkEyXkFqcGc@._V1_QL75_UY281_CR18,0,190,281_.jpg',
    director: 'Sandeep Reddy Vanga',
    rating: 7.0,
    totalReviews: 45000,
  },
  {
    title: 'Pathaan',
    description: 'An exiled spy returns to India to take on a mercenary organization plotting a deadly attack.',
    genre: ['Action', 'Thriller'],
    language: ['Hindi', 'Tamil', 'Telugu'],
    duration: 146,
    releaseDate: new Date('2023-01-25'),
    poster: 'https://m.media-amazon.com/images/M/MV5BNDdkNTY1MDQtY2I5MC00OTFlLTg5OWQtZWE2YzE5NWFiMDgzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    director: 'Siddharth Anand',
    rating: 5.9,
    totalReviews: 38000,
  },
  {
    title: 'Jawan',
    description: 'A man is driven by a personal vendetta to rectify the wrongs in society while fighting against a flawed system.',
    genre: ['Action', 'Drama'],
    language: ['Hindi', 'Tamil', 'Telugu'],
    duration: 169,
    releaseDate: new Date('2023-09-07'),
    poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3OMsQqM_hs8eK5mM8KBCyY8hBfSeJMxGkjQ&s',
    director: 'Atlee',
    rating: 7.0,
    totalReviews: 52000,
  },
  {
    title: 'Rocky Aur Rani Kii Prem Kahaani',
    description: 'A love story about two people from contrasting backgrounds who learn about life and love.',
    genre: ['Romance', 'Drama', 'Comedy'],
    language: ['Hindi'],
    duration: 168,
    releaseDate: new Date('2023-07-28'),
    poster: 'https://d3lzcn6mbbadaf.cloudfront.net/media/details/ANI-20231009160655.jpg',
    director: 'Karan Johar',
    rating: 7.2,
    totalReviews: 28000,
  },
  {
    title: 'Dunki',
    description: 'Four friends take the illegal \'donkey\' route to travel to the UK, facing hardships along the way.',
    genre: ['Comedy', 'Drama'],
    language: ['Hindi', 'Tamil', 'Telugu'],
    duration: 161,
    releaseDate: new Date('2023-12-21'),
    poster: 'https://approachbollywood.com/wp-content/uploads/2023/12/dunki-poster-585x470.jpg',
    director: 'Rajkumar Hirani',
    rating: 6.5,
    totalReviews: 31000,
  },
  {
    title: 'Leo',
    description: 'A mild-mannered cafe owner\'s mysterious past is unearthed when a gang targets him.',
    genre: ['Action', 'Thriller', 'Drama'],
    language: ['Tamil', 'Hindi', 'Telugu'],
    duration: 164,
    releaseDate: new Date('2023-10-19'),
    poster: 'https://upload.wikimedia.org/wikipedia/en/7/75/Leo_%282023_Indian_film%29.jpg',
    director: 'Lokesh Kanagaraj',
    rating: 7.3,
    totalReviews: 41000,
  },
  {
    title: 'Kalki 2898 AD',
    description: 'A modern-day avatar of Vishnu is foretold to be born in the dystopian city of Kasi in the year 2898 AD.',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    language: ['Telugu', 'Hindi', 'Tamil'],
    duration: 181,
    releaseDate: new Date('2024-06-27'),
    poster: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kalki_2898_AD.jpg/250px-Kalki_2898_AD.jpg',
    director: 'Nag Ashwin',
    rating: 7.6,
    totalReviews: 62000,
  },
  {
    title: 'Stree 2',
    description: 'The residents of Chanderi must once again band together to battle a new supernatural evil threatening their town.',
    genre: ['Horror', 'Comedy'],
    language: ['Hindi'],
    duration: 158,
    releaseDate: new Date('2024-08-15'),
    poster: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg',
    director: 'Amar Kaushik',
    rating: 8.0,
    totalReviews: 74000,
  },
];

const theatres = [
  {
    name: 'PVR Cinemas - Phoenix Mall',
    address: 'Phoenix Mall, Nagar Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014',
    phone: '020-66310000',
    totalSeats: 80,
    seatLayout: {
      rows: 8,
      cols: 10,
      categories: [
        { name: 'Recliner', rows: ['A', 'B'], price: 500 },
        { name: 'Gold', rows: ['C', 'D', 'E'], price: 300 },
        { name: 'Silver', rows: ['F', 'G', 'H'], price: 180 },
      ],
    },
  },
  {
    name: 'INOX - Westend Mall',
    address: 'Westend Mall, Aundh',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411007',
    phone: '020-66410000',
    totalSeats: 80,
    seatLayout: {
      rows: 8,
      cols: 10,
      categories: [
        { name: 'Recliner', rows: ['A', 'B'], price: 450 },
        { name: 'Gold', rows: ['C', 'D', 'E'], price: 280 },
        { name: 'Silver', rows: ['F', 'G', 'H'], price: 160 },
      ],
    },
  },
  {
    name: 'Cinepolis - Fun Republic Mall',
    address: 'Fun Republic Mall, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    phone: '022-40000000',
    totalSeats: 80,
    seatLayout: {
      rows: 8,
      cols: 10,
      categories: [
        { name: 'Recliner', rows: ['A', 'B'], price: 600 },
        { name: 'Gold', rows: ['C', 'D', 'E'], price: 350 },
        { name: 'Silver', rows: ['F', 'G', 'H'], price: 200 },
      ],
    },
  },
];

const SHOW_TIMES = ['10:00 AM', '1:30 PM', '4:45 PM', '8:00 PM'];
const FORMATS = ['2D', '3D', 'IMAX'];
const LANGUAGES = ['Hindi', 'English', 'Tamil'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }

  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  console.log('✔ Users cleared');
  await Movie.deleteMany({});
  console.log('✔ Movies cleared');
  await Theatre.deleteMany({});
  console.log('✔ Theatres cleared');
  await Show.deleteMany({});
  console.log('✔ Shows cleared');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@bookmyshow.com',
    password: 'admin123',
    phone: '9999999999',
    role: 'admin',
  });

  // Create sample user
  await User.create({
    name: 'Demo User',
    email: 'user@bookmyshow.com',
    password: 'user123',
    phone: '8888888888',
    role: 'user',
  });

  console.log('👤 Created users');

  // Insert movies
  const createdMovies = await Movie.insertMany(movies);
  console.log(`🎬 Inserted ${createdMovies.length} movies`);

  // Insert theatres
  const createdTheatres = await Theatre.insertMany(theatres);
  console.log(`🏛️  Inserted ${createdTheatres.length} theatres`);

  // Create shows for next 5 days
  const shows = [];
  const today = new Date();

  createdMovies.forEach((movie) => {
    createdTheatres.forEach((theatre) => {
      for (let day = 0; day < 5; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);

        // 2 show times per movie per theatre per day
        const times = SHOW_TIMES.slice(0, 2);
        times.forEach((time, i) => {
          shows.push({
            movie: movie._id,
            theatre: theatre._id,
            date,
            time,
            language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
            format: FORMATS[i % FORMATS.length],
            totalSeats: 80,
            bookedSeats: [],
            price: {
              recliner: theatre.seatLayout.categories[0].price,
              gold: theatre.seatLayout.categories[1].price,
              silver: theatre.seatLayout.categories[2].price,
            },
          });
        });
      }
    });
  });

  await Show.insertMany(shows);
  console.log(`🎭 Inserted ${shows.length} shows`);

  console.log('\n✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:  admin@bookmyshow.com / admin123');
  console.log('👤 User:   user@bookmyshow.com  / user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

const fs = require('fs');
const envFile = fs.readFileSync('./server/.env', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) process.env[key.trim()] = val.join('=').trim();
});
const mongoose = require('mongoose');

const Movie = require('./server/models/Movie');
const Theatre = require('./server/models/Theatre');
const Show = require('./server/models/Show');

const times = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'];
const formats = ['2D', '3D', 'IMAX'];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Find the two movies
  const hailMary = await Movie.findOne({ title: /hail mary/i });
  const f1 = await Movie.findOne({ title: /^F1$/i });

  if (!hailMary) { console.error('❌ Project Hail Mary not found'); process.exit(1); }
  if (!f1) { console.error('❌ F1 not found'); process.exit(1); }

  console.log(`🎬 Found: ${hailMary.title} (${hailMary._id})`);
  console.log(`🎬 Found: ${f1.title} (${f1._id})`);

  const theatres = await Theatre.find({ isActive: true });
  console.log(`🏛️  Found ${theatres.length} theatres`);

  // Generate dates: next 7 days
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(new Date(d));
  }

  const movies = [hailMary, f1];
  const showsToInsert = [];

  for (const movie of movies) {
    for (const theatre of theatres) {
      for (const date of dates) {
        for (const time of times) {
          // Rotate format based on time index
          const fmt = formats[times.indexOf(time) % formats.length];
          const lang = movie.language?.[0] || 'English';

          // Build price from theatre seat layout
          const price = {};
          if (theatre.seatLayout?.categories) {
            theatre.seatLayout.categories.forEach((cat) => {
              price[cat.name] = cat.price;
            });
          } else {
            price['Silver'] = 180;
            price['Gold'] = 300;
            price['Recliner'] = 500;
          }

          showsToInsert.push({
            movie: movie._id,
            theatre: theatre._id,
            date,
            time,
            language: lang,
            format: fmt,
            totalSeats: theatre.totalSeats || 80,
            bookedSeats: [],
            price,
            isActive: true,
          });
        }
      }
    }
  }

  // Remove existing shows for these two movies to avoid duplicates
  const deleted = await Show.deleteMany({ movie: { $in: [hailMary._id, f1._id] } });
  console.log(`🗑️  Removed ${deleted.deletedCount} existing shows for these movies`);

  await Show.insertMany(showsToInsert);
  console.log(`✅ Inserted ${showsToInsert.length} shows!`);
  console.log(`   → ${movies.length} movies × ${theatres.length} theatres × ${dates.length} dates × ${times.length} times`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });

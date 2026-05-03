const { createClient } = require('redis');

let redisClient = null;
let redisAvailable = false;

// In-memory fallback when Redis is not available
const memoryStore = {};

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
  expire: async () => {},
};

async function connectRedis() {
  try {
    // Only try to connect if REDIS_URL is provided or we are explicitly in dev mode
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd && !process.env.REDIS_URL) {
      throw new Error('No REDIS_URL in production');
    }

    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries reached');
          return 1000;
        }
      }
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err.message));
    await redisClient.connect();
    redisAvailable = true;
    console.log('✅ Redis connected');
  } catch (err) {
    console.warn('⚠️  Redis not available, using in-memory fallback. Seat locking will not persist across restarts.');
    redisAvailable = false;
  }
}

function getRedisClient() {
  return redisAvailable && redisClient ? redisClient : fallback;
}

module.exports = { get redisClient() { return getRedisClient(); }, connectRedis };

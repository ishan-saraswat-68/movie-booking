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
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
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

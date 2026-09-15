const { createClient } = require('redis');

let redisClient = null;
let redisAvailable = false;

// In-memory fallback when Redis is not available
const memoryStore = {};

const fallback = {
  get: async (key) => {
    const entry = memoryStore[key];
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      delete memoryStore[key];
      return null;
    }
    return typeof entry === 'object' && entry.value !== undefined ? entry.value : entry;
  },
  set: async (key, value, options = {}) => {
    const existing = memoryStore[key];
    const isExpired = existing && existing.expiresAt && existing.expiresAt < Date.now();
    if (existing && !isExpired && options.NX) {
      return null; // Key exists and NX was requested
    }
    if (existing && existing.timer) {
      clearTimeout(existing.timer);
    }
    const ttlMs = options.EX ? options.EX * 1000 : null;
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    const timer = ttlMs ? setTimeout(() => delete memoryStore[key], ttlMs) : null;
    if (timer && timer.unref) timer.unref();

    memoryStore[key] = { value: String(value), expiresAt, timer };
    return 'OK';
  },
  del: async (key) => {
    if (memoryStore[key]) {
      if (memoryStore[key].timer) clearTimeout(memoryStore[key].timer);
      delete memoryStore[key];
      return 1;
    }
    return 0;
  },
  keys: async (pattern) => {
    const now = Date.now();
    for (const k of Object.keys(memoryStore)) {
      if (memoryStore[k]?.expiresAt && memoryStore[k].expiresAt < now) {
        if (memoryStore[k].timer) clearTimeout(memoryStore[k].timer);
        delete memoryStore[k];
      }
    }
    const regexStr = '^' + pattern.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexStr);
    return Object.keys(memoryStore).filter((k) => regex.test(k));
  },
  eval: async (script, { keys, arguments: args } = {}) => {
    if (!keys || !keys.length) return 0;
    const key = keys[0];
    const expectedValue = args && args[0] ? String(args[0]) : null;
    const entry = memoryStore[key];
    if (entry && String(entry.value) === expectedValue) {
      if (entry.timer) clearTimeout(entry.timer);
      delete memoryStore[key];
      return 1;
    }
    return 0;
  },
  // Hash methods for backwards compatibility
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
    console.warn('⚠️  Redis not available, using in-memory fallback with atomic support.');
    redisAvailable = false;
  }
}

function getRedisClient() {
  return redisAvailable && redisClient ? redisClient : fallback;
}

/**
 * Safely releases a distributed lock only if it is still owned by ownerId.
 * Prevents releasing another client's lock if the current lock expired.
 */
async function releaseLock(key, ownerId) {
  const client = getRedisClient();
  const ownerStr = String(ownerId);

  if (redisAvailable && redisClient) {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await client.eval(luaScript, {
      keys: [key],
      arguments: [ownerStr],
    });
  }

  return await fallback.eval('', { keys: [key], arguments: [ownerStr] });
}

module.exports = {
  get redisClient() {
    return getRedisClient();
  },
  connectRedis,
  releaseLock,
};

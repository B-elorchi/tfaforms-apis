const Redis = require("ioredis");
require('dotenv').config();

console.log("REDIS_URL:", process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL );

(async () => {
  try {
    await redis.set("test_key", "Hello Redis!");
    const value = await redis.get("test_key");
    console.log("Redis is working! Value:", value);
    redis.quit();
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
})();

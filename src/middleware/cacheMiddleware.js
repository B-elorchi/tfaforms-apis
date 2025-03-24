const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);

const cacheMiddleware = (key) => {
  return async (req, res, next) => {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log("Serving from cache");
        return res.status(200).json(JSON.parse(cachedData));
      }
      req.Key = key;
      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, redisClient };

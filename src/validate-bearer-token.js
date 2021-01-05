const { API_TOKEN } = require('./config')
const logger = require('./logger')

function validateBearerToken (req, res, next) {
    const authToken = req.get("Authorization");
    logger.error(`Intruder at ${req.path}!`)
    if (!authToken || authToken.split(" ")[1] !== API_TOKEN) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
  }

  module.exports = validateBearerToken
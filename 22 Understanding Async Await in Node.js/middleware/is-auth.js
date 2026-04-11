const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get the token from the header
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated. No token provided.");
    error.statusCode = 401;
    throw error;
  }

  const authToken = authHeader.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(authToken, "secretkeyforjwttokengeneration"); // decode and verify the token using verify method
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId; // add the userId from the token to the request object so that it can be used in the next middleware or route handler

  next();
};

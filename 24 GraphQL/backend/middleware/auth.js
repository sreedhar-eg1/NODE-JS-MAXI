const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get the token from the header
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    next();
  }

  const authToken = authHeader.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(authToken, "mySecretKey"); // decode and verify the token using verify method
  } catch (err) {
    req.isAuth = false;
    next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    next();
  }

  req.userId = decodedToken.userId; // add the userId from the token to the request object so that it can be used in the next middleware or route handler
  req.isAuth = true;

  next();
};

const { doubleCsrf } = require("csrf-csrf");

const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateCsrfToken, // Use this in your routes to provide a CSRF token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: (req) => "node complete csrf attack protection",
  getSessionIdentifier: (req) => req.session.id, // return the requests unique identifier
  ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
  getCsrfTokenFromRequest: (req) => req.body.csrf,
});

// Export so routes can use it
module.exports = {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
  validateRequest,
};

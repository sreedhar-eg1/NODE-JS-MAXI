exports.getLogin = (req, res, next) => {
  const isLoggedIn = req
    .get("Cookie")
    .split(";")
    .at(-1)
    .trim()
    .split("=")
    .at(-1);

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true
  req.session.isLoggedIn = true; // setting session value using session property
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};

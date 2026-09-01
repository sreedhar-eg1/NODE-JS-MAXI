import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import FeedPage from "./pages/Feed/Feed";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost";
import LoginPage from "./pages/Auth/Login";
import SignupPage from "./pages/Auth/Signup";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const logoutTimerRef = useRef();

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
  }, []);

  const logoutHandler = useCallback(() => {
    clearLogoutTimer();
    setIsAuth(false);
    setToken(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
  }, [clearLogoutTimer]);

  const setAutoLogout = useCallback(
    (milliseconds) => {
      clearLogoutTimer();
      logoutTimerRef.current = setTimeout(() => {
        logoutHandler();
      }, milliseconds);
    },
    [clearLogoutTimer, logoutHandler],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");

    if (!storedToken || !expiryDate) {
      return undefined;
    }

    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return undefined;
    }

    const storedUserId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();

    setIsAuth(true);
    setToken(storedToken);
    setUserId(storedUserId);
    setAutoLogout(remainingMilliseconds);

    return () => {
      clearLogoutTimer();
    };
  }, [clearLogoutTimer, logoutHandler, setAutoLogout]);

  const mobileNavHandler = useCallback((isOpen) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  }, []);

  const backdropClickHandler = useCallback(() => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  }, []);

  const loginHandler = useCallback(
    (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);

      const graphqlQuery = {
        query: `
          {
            login(email: "${authData.email}", password: "${authData.password}") {
              token
              userId
            }
          }
        `,
      };

      fetch("http://localhost:8080/graphql", {
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          // GraphQL errors come back inside the JSON body, not via HTTP status,
          // so just parse it here and inspect errors in the next .then
          return res.json();
        })
        .then((resData) => {
          if (resData.errors) {
            const message =
              resData.errors[0].message || "Could not authenticate you!";
            throw new Error(message);
          }

          const loginData = resData.data.login;

          setIsAuth(true);
          setToken(loginData.token);
          setAuthLoading(false);
          setUserId(loginData.userId);
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("userId", loginData.userId);
          const remainingMilliseconds = 60 * 60 * 1000;
          const expiryDate = new Date(
            new Date().getTime() + remainingMilliseconds,
          );
          localStorage.setItem("expiryDate", expiryDate.toISOString());
          setAutoLogout(remainingMilliseconds);
        })
        .catch((err) => {
          setIsAuth(false);
          setAuthLoading(false);
          setError(err);
        });
    },
    [setAutoLogout],
  );

  const signupHandler = useCallback(
    (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);

      const graphqlQuery = {
        query: `
          mutation {
            createUser(userInput: 
            {email: "${authData.signupForm.email.value}", name: "${authData.signupForm.name.value}",
             password: "${authData.signupForm.password.value}"}) {
              _id
              email
            }
          }
        `,
      };

      fetch("http://localhost:8080/graphql", {
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((resData) => {
          if (resData.errors) {
            const message = resData.errors[0].message || "Validation failed!";
            throw new Error(message);
          }

          setIsAuth(false);
          setAuthLoading(false);
          navigate("/", { replace: true });
        })
        .catch((err) => {
          setIsAuth(false);
          setAuthLoading(false);
          setError(err);
        });
    },
    [navigate],
  );

  const errorHandler = useCallback(() => {
    setError(null);
  }, []);

  let routes = (
    <Routes>
      <Route
        path="/"
        element={<LoginPage onLogin={loginHandler} loading={authLoading} />}
      />
      <Route
        path="/signup"
        element={<SignupPage onSignup={signupHandler} loading={authLoading} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (isAuth) {
    routes = (
      <Routes>
        <Route path="/" element={<FeedPage userId={userId} token={token} />} />
        <Route
          path="/:postId"
          element={<SinglePostPage userId={userId} token={token} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={() => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={() => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />
      {routes}
    </Fragment>
  );
}

export default App;

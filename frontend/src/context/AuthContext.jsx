// AuthContext.jsx - keeps the logged in user in one place.
//
// Without a context we would have to pass the token down as a prop through
// every component. With the context any component can just call useAuth().
//
// WHERE DO WE KEEP THE TOKEN?
// The safest place is a httpOnly cookie, because JavaScript cannot read it, so
// a cross site scripting attack cannot steal it. We could not use that here
// because our API and our React app run on two different ports and the cookie
// setup with SameSite was getting too complicated for this milestone.
// So we keep the token in a React state (memory) and copy it into
// sessionStorage. sessionStorage is better than localStorage for us because it
// is deleted when the browser tab is closed, so the token does not stay on a
// shared lab computer forever. We also give the token a short life (2h) in the
// backend. This trade-off is written down in our documentation.
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";

const AuthContext = createContext(null);

// every component can call this to get { user, token, login, register, logout }
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);
  // while we are asking the API "is my token still good?" we do not know yet if
  // the user is logged in, so the protected pages have to wait
  const [checkingToken, setCheckingToken] = useState(true);

  // Runs once when the app starts (and again if the token changes).
  // If we already have a token from a previous page load we ask GET /auth/me
  // if it is still valid. If it is not, we throw it away.
  useEffect(() => {
    if (!token) {
      setUser(null);
      setCheckingToken(false);
      return;
    }

    apiRequest("/auth/me", { token: token })
      .then((me) => {
        setUser(me);
        setCheckingToken(false);
      })
      .catch(() => {
        // token expired or it was edited by hand -> log out
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setCheckingToken(false);
      });
  }, [token]);

  async function login(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email: email, password: password },
    });
    sessionStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, phone) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { name: name, email: email, password: password, phone: phone },
    });
    sessionStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // logout is just "forget the token". The token itself stays valid until it
  // expires, that is how JWT works, which is why we keep the 2 hour expiry.
  function logout() {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = {
    user: user,
    token: token,
    checkingToken: checkingToken,
    isLoggedIn: !!user,
    isAdmin: user ? user.role === "admin" : false,
    login: login,
    register: register,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; 

export function Layout() {
  return (
    <div className="layout">
      <div className="navbar"><Navbar /></div>
      <div className="content"><Outlet /></div>
    </div>
  );
}

export function RequireAuth() {
  const { currentUser, isLoading } = useContext(AuthContext);

  // Wait for the initial /auth/me check to finish before deciding
  // anything. Without this, every page refresh on a protected route
  // would briefly redirect a logged-in user to /login, because
  // currentUser starts as null until that request resolves.
  if (isLoading) {
    return <div className="auth-checking">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <div className="navbar"><Navbar /></div>
      <div className="content"><Outlet /></div>
    </div>
  );
}
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authServices";

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/projects/explore"
          className="text-xl font-bold text-slate-900"
        >
          TeamForge
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/projects/explore" className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/projects/me" className={linkClass}>
            My Projects
          </NavLink>
          <NavLink to="/projects/create" className={linkClass}>
            Create
          </NavLink>
          <NavLink to="/requests/me" className={linkClass}>
            Requests
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

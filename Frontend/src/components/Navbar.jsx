import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authServices";
import { getProfileImage, getUserInitials } from "../utils/profileHelpers";

function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileImage = getProfileImage(currentUser);
  const userInitials = getUserInitials(currentUser);
  const displayName =
    currentUser?.fullName || currentUser?.userName || "TeamForge user";

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-sky-500 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);

    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // API call for logout: POST /api/v1/users/logout
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch {
    } finally {
      setLoading(false);
      setProfileMenuOpen(false);
    }
  };

  return (
    <header className="relative z-20 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/projects/explore"
            className="text-xl font-bold text-white"
          >
            TeamForge
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <NavLink to="/projects/explore" className={linkClass}>
              Explore Projects
            </NavLink>
            <NavLink to="/projects/me" className={linkClass}>
              My Projects
            </NavLink>
            <NavLink to="/requests/me" className={linkClass}>
              My Requests
            </NavLink>
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-left transition hover:bg-slate-800"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {displayName}
                </span>
                {currentUser?.userName && (
                  <span className="block truncate text-xs text-slate-400">
                    @{currentUser.userName}
                  </span>
                )}
              </span>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-white/10 bg-slate-900 py-2 shadow-2xl shadow-slate-950/40"
                role="menu"
              >
                <Link
                  to="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  role="menuitem"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  role="menuitem"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/change-password"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  role="menuitem"
                >
                  Change Password
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:text-red-900"
                  role="menuitem"
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authServices";
import ErrorAlert from "./ErrorAlert";
import { getProfileImage, getUserInitials } from "../utils/profileHelpers";

const formatNotificationDate = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

const formatNotificationType = (type) => {
  const map = {
    NEW_REQUEST: "New Request",
    REQUEST_STATUS_UPDATED: "Request Status Updated",
  };

  return map[type] || "Notification";
};

function Navbar({
  currentUser,
  notifications,
  unreadNotificationCount,
  notificationsLoading,
  notificationsError,
  onRetryNotifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  activeNotificationId,
  markAllNotificationsLoading,
  onLogout,
}) {
  const navigate = useNavigate();
  const notificationMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
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
    const closeMenus = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) {
        setNotificationMenuOpen(false);
      }

      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // API call for logout: POST /api/v1/users/logout
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
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

          <div ref={notificationMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationMenuOpen((isOpen) => !isOpen);
                setProfileMenuOpen(false);
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800 hover:text-white"
              aria-expanded={notificationMenuOpen}
              aria-haspopup="menu"
              aria-label={`Notifications${
                unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ""
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 17a3 3 0 0 0 6 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-lg shadow-rose-950/40">
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-[22.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/40 backdrop-blur"
                role="menu"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-400">
                      {unreadNotificationCount} unread
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    disabled={
                      !unreadNotificationCount || markAllNotificationsLoading
                    }
                    className="text-xs font-medium text-sky-300 transition hover:text-sky-200 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    {markAllNotificationsLoading
                      ? "Marking..."
                      : "Mark all as read"}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-6 text-sm text-slate-400">
                      Loading notifications...
                    </div>
                  ) : notificationsError ? (
                    <div className="space-y-3 px-4 py-6">
                      <ErrorAlert className="px-3 py-2 text-xs">
                        {notificationsError}
                      </ErrorAlert>
                      <button
                        type="button"
                        onClick={onRetryNotifications}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                      >
                        Retry
                      </button>
                    </div>
                  ) : notifications.length ? (
                    <div className="divide-y divide-white/5">
                      {notifications.map((notification) => {
                        const isActive =
                          activeNotificationId === notification._id;

                        return (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() => {
                              setNotificationMenuOpen(false);
                              onNotificationClick(notification._id);
                            }}
                            disabled={isActive}
                            className={`block w-full px-4 py-3.5 text-left transition ${
                              notification.isRead
                                ? "bg-transparent hover:bg-white/5"
                                : "bg-sky-500/10 hover:bg-sky-500/15"
                            } ${isActive ? "cursor-wait" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-1">
                                <div className="flex items-start gap-2">
                                  <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-white">
                                    {notification.message}
                                  </span>
                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                                  )}
                                </div>
                                <p className="text-xs font-medium text-slate-400">
                                  {formatNotificationType(notification.type)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>
                              {isActive && (
                                <span className="mt-0.5 shrink-0 text-xs text-slate-500">
                                  Saving...
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-400">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((isOpen) => !isOpen);
                setNotificationMenuOpen(false);
              }}
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

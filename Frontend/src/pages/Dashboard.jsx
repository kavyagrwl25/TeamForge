import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const displayName = user?.fullName || user?.userName || "there";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);

    try {
      await logoutUser();
      onLogout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Logout failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">TeamForge</p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Welcome, {displayName}
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/change-password"
                className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Change Password
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          <p className="mt-3 text-slate-300">
            This is your protected dashboard. More project features can be added
            here after the auth flow is stable.
          </p>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/projects/create"
            className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <p className="font-semibold text-white">Create Project</p>
            <p className="mt-2 text-sm text-slate-300">
              Add a new project and list the roles you need.
            </p>
          </Link>

          <Link
            to="/projects/me"
            className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <p className="font-semibold text-white">My Projects</p>
            <p className="mt-2 text-sm text-slate-300">
              View the projects you have created.
            </p>
          </Link>

          <Link
            to="/projects/explore"
            className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <p className="font-semibold text-white">Explore Projects</p>
            <p className="mt-2 text-sm text-slate-300">
              Browse open projects from other users.
            </p>
          </Link>

          <Link
            to="/requests/me"
            className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <p className="font-semibold text-white">My Sent Requests</p>
            <p className="mt-2 text-sm text-slate-300">
              Track requests you have sent to join projects.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

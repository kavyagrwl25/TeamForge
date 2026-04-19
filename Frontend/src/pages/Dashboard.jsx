import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authServices";

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
      console.error(err);
      setError("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">TeamForge</p>
              <h1 className="mt-2 text-3xl font-bold">
                Welcome, {displayName}
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/change-password"
                className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-100"
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

          <p className="mt-3 text-slate-600">
            This is your protected dashboard. More project features can be added
            here after the auth flow is stable.
          </p>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            to="/projects/create"
            className="rounded-lg bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">Create Project</p>
            <p className="mt-2 text-sm text-slate-600">
              Add a new project and list the roles you need.
            </p>
          </Link>

          <Link
            to="/projects/me"
            className="rounded-lg bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">My Projects</p>
            <p className="mt-2 text-sm text-slate-600">
              View the projects you have created.
            </p>
          </Link>

          <Link
            to="/projects/explore"
            className="rounded-lg bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">Explore Projects</p>
            <p className="mt-2 text-sm text-slate-600">
              Browse open projects from other users.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

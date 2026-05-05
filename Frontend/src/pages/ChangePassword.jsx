import { useState } from "react";
import ErrorAlert from "../components/ErrorAlert";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../services/authServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.currentPassword || !formData.newPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess("Password changed successfully. Redirecting to dashboard...");
      setFormData({
        currentPassword: "",
        newPassword: "",
      });

      setTimeout(() => {
        navigate("/projects/explore", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Password change failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-lg border border-white/10 bg-slate-900/85 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur"
        >
          <p className="text-sm font-medium text-slate-400">Account security</p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Change Password
          </h1>

          <div className="mt-6 space-y-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current password"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {loading ? "Changing password..." : "Change Password"}
            </button>
          </div>

          {error && <ErrorAlert className="mt-4">{error}</ErrorAlert>}
          {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

          <Link
            to="/projects/explore"
            className="mt-6 inline-block text-sm font-medium text-sky-300 underline"
          >
            Back to explore projects
          </Link>
        </form>
      </main>
    </div>
  );
}

export default ChangePassword;

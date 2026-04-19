import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authServices";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-700">
        <main className="mx-auto max-w-4xl">Loading profile...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 text-red-500">
        <main className="mx-auto max-w-4xl">{error}</main>
      </div>
    );
  }

  const skills = user?.skills || [];
  const socialLinks = user?.socialLinks || {};

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <h1 className="mt-2 text-3xl font-bold">{user.fullName}</h1>
              <p className="mt-1 text-slate-500">@{user.userName}</p>
            </div>

            <Link
              to="/settings"
              className="rounded-lg bg-slate-900 px-4 py-2 text-center font-medium text-white transition hover:bg-slate-700"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Email</p>
              <p className="mt-1 text-slate-800">{user.email}</p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Bio</p>
              <p className="mt-1 text-slate-800">
                {user.bio || "No bio added yet."}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-600">No skills added yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500">
              Social Links
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              {socialLinks.github ? (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  GitHub
                </a>
              ) : (
                <span className="text-slate-600">No GitHub link</span>
              )}

              {socialLinks.linkedin ? (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  LinkedIn
                </a>
              ) : (
                <span className="text-slate-600">No LinkedIn link</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;

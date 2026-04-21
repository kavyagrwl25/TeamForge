import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authServices";
import { getProfileImage, getUserInitials } from "../utils/profileHelpers";

function Profile({ currentUser }) {
  const [fetchedUser, setFetchedUser] = useState(null);
  const [fetching, setFetching] = useState(!currentUser);
  const [error, setError] = useState("");
  const user = currentUser || fetchedUser;
  const loading = !user && fetching;

  useEffect(() => {
    if (currentUser) {
      return;
    }

    const fetchProfile = async () => {
      try {
        // API call happens only when the app does not already have the user.
        // Exact backend route: GET /api/v1/users/me
        const response = await getCurrentUser();
        setFetchedUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 text-slate-300">
        <main className="mx-auto max-w-4xl">Loading profile...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 text-red-300">
        <main className="mx-auto max-w-4xl">{error}</main>
      </div>
    );
  }

  const skills = Array.isArray(user?.skills) ? user.skills : [];
  const socialLinks = user?.socialLinks || {};
  const profileImage = getProfileImage(user);
  const userInitials = getUserInitials(user);
  const displayName = user?.fullName || "Name not available";
  const userName = user?.userName || "Username not available";
  const email = user?.email || "Email not available";
  const bio = user?.bio || "No bio added";
  const githubLink = socialLinks.github || user?.github || "";
  const linkedinLink = socialLinks.linkedin || user?.linkedin || "";

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  My Profile
                </p>
                <h1 className="mt-1 text-3xl font-bold text-white">{displayName}</h1>
                <p className="mt-1 text-slate-400">
                  {user?.userName ? `@${user.userName}` : userName}
                </p>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-center font-medium text-white transition hover:bg-sky-400"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-400">
                Full Name
              </p>
              <p className="mt-1 text-slate-100">{displayName}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-400">Username</p>
              <p className="mt-1 text-slate-100">
                {user?.userName ? `@${user.userName}` : userName}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-400">Email</p>
              <p className="mt-1 text-slate-100">{email}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-400">Bio</p>
              <p className="mt-1 text-slate-100">{bio}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-400">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-400">No skills added</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-400">
              Social Links
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              {githubLink ? (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  GitHub
                </a>
              ) : (
                <span className="text-slate-400">GitHub not added</span>
              )}

              {linkedinLink ? (
                <a
                  href={linkedinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  LinkedIn
                </a>
              ) : (
                <span className="text-slate-400">LinkedIn not added</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;

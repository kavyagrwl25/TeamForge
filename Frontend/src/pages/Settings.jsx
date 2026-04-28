import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  updateProfile,
} from "../services/authServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

function Settings({ onAccountDeleted, onProfileUpdated }) {
  const navigate = useNavigate();

  const [initialProfile, setInitialProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    userName: "",
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        const user = response.data;

        setInitialProfile(user);
        setProfileForm({
          fullName: user.fullName || "",
          userName: user.userName || "",
          bio: user.bio || "",
          skills: (user.skills || []).join(", "),
          github: user.socialLinks?.github || "",
          linkedin: user.socialLinks?.linkedin || "",
        });
      } catch (err) {
        setProfileError(getApiErrorMessage(err, "Could not load profile."));
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const splitSkills = (value) => {
    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const buildProfilePayload = () => {
    const payload = {};
    const originalSkills = (initialProfile.skills || []).join(", ");
    const originalGithub = initialProfile.socialLinks?.github || "";
    const originalLinkedin = initialProfile.socialLinks?.linkedin || "";

    if (profileForm.fullName !== initialProfile.fullName) {
      payload.fullName = profileForm.fullName;
    }

    if (profileForm.userName !== initialProfile.userName) {
      payload.userName = profileForm.userName;
    }

    if (profileForm.bio !== (initialProfile.bio || "")) {
      if (!profileForm.bio.trim()) {
        throw new Error("Bio cannot be empty when updating it.");
      }

      payload.bio = profileForm.bio;
    }

    if (profileForm.skills !== originalSkills) {
      payload.skills = splitSkills(profileForm.skills);
    }

    if (
      profileForm.github !== originalGithub ||
      profileForm.linkedin !== originalLinkedin
    ) {
      payload.socialLinks = {
        github: profileForm.github.trim() || null,
        linkedin: profileForm.linkedin.trim() || null,
      };
    }

    return payload;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const payload = buildProfilePayload();

      if (Object.keys(payload).length === 0) {
        setProfileError("No profile changes to save.");
        return;
      }

      const response = await updateProfile(payload);
      const user = response.data;

      setInitialProfile(user);
      setProfileForm({
        fullName: user.fullName || "",
        userName: user.userName || "",
        bio: user.bio || "",
        skills: (user.skills || []).join(", "),
        github: user.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
      });
      onProfileUpdated?.(user);
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(getApiErrorMessage(err, "Profile update failed."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
      setPasswordSuccess("Password changed successfully.");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Password change failed."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    setDeleteError("");
    setDeleteLoading(true);

    try {
      await deleteAccount({ password: deletePassword });
      onAccountDeleted();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Account deletion failed."));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen px-4 py-8 text-slate-300">
        <main className="mx-auto max-w-5xl">Loading settings...</main>
      </div>
    );
  }

  if (!initialProfile) {
    return (
      <div className="min-h-screen px-4 py-8 text-red-300">
        <main className="mx-auto max-w-5xl">
          {profileError || "Could not load settings."}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-400">Account</p>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <h2 className="text-xl font-bold text-white">Update Profile</h2>

            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={profileForm.fullName}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <input
                type="text"
                name="userName"
                placeholder="Username"
                value={profileForm.userName}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <textarea
                name="bio"
                placeholder="Bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                rows="4"
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <input
                type="text"
                name="skills"
                placeholder="Skills, separated by commas"
                value={profileForm.skills}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <input
                type="url"
                name="github"
                placeholder="GitHub profile link"
                value={profileForm.github}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <input
                type="url"
                name="linkedin"
                placeholder="LinkedIn profile link"
                value={profileForm.linkedin}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />

              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {profileError && (
              <p className="mt-4 text-sm text-red-500">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="mt-4 text-sm text-green-600">{profileSuccess}</p>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-lg border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
              <h2 className="text-xl font-bold text-white">Change Password</h2>

              <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </form>

              {passwordError && (
                <p className="mt-4 text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="mt-4 text-sm text-green-600">
                  {passwordSuccess}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 shadow-2xl shadow-slate-950/30">
              <h2 className="text-xl font-bold text-red-200">
                Delete Account
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                This permanently deletes your account, projects, and related
                requests.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-5 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                Delete Account
              </button>
            </section>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <form
            onSubmit={handleDeleteSubmit}
            className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-slate-950/50"
          >
            <h2 className="text-2xl font-bold text-red-200">
              Confirm Account Delete
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter your password to confirm this action.
            </p>

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Password"
              className="mt-5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            {deleteError && (
              <p className="mt-4 text-sm text-red-500">{deleteError}</p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="rounded-lg border border-white/10 px-4 py-3 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Settings;

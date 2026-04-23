import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "../services/projectServices";

const projectTypes = ["personal", "startup", "hackathon", "open-source"];
const projectStatuses = ["open", "closed"];

function Field({ id, label, helper, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-200">
        {label}
      </label>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 shadow-inner shadow-slate-950/30 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-cyan-300/70 focus:bg-slate-950/80 focus:ring-4 focus:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-70";

function FeedbackMessage({ type, children }) {
  const styles =
    type === "success"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : "border-rose-300/25 bg-rose-500/10 text-rose-100";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    rolesNeeded: "",
    projectType: "personal",
    repoLink: "",
    status: "open",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      setLoadError("");

      try {
        // Existing project data is fetched from the exact backend route:
        // GET /api/v1/projects/:projectId
        const response = await getProjectById(projectId);
        const project = response.data;
        const rolesNeeded = Array.isArray(project.rolesNeeded)
          ? project.rolesNeeded
          : [];

        // Arrays are shown as comma-separated strings because that is easier
        // to scan and edit in a compact dashboard form.
        setFormData({
          title: project.title || "",
          description: project.description || "",
          techStack: Array.isArray(project.techStack)
            ? project.techStack.join(", ")
            : "",
          rolesNeeded: rolesNeeded.join(", "),
          projectType: project.projectType || "personal",
          repoLink: project.repoLink || "",
          status: project.status || "open",
        });
      } catch (err) {
        setLoadError(
          err.response?.data?.message || "Could not load project details."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const isBusy = saving || deleting;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const splitToArray = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const buildPayload = () => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      techStack: splitToArray(formData.techStack),
      rolesNeeded: splitToArray(formData.rolesNeeded),
      projectType: formData.projectType,
      repoLink: formData.repoLink.trim(),
      status: formData.status,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSaving(true);

    try {
      await updateProject(projectId, buildPayload());
      setSuccess("Project updated successfully. Returning to My Projects...");

      setTimeout(() => {
        navigate("/projects/me", { replace: true });
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Project update failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSuccess("");

    const confirmed = window.confirm(
      "Delete this project? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteProject(projectId);
      setSuccess("Project deleted successfully. Returning to My Projects...");

      setTimeout(() => {
        navigate("/projects/me", { replace: true });
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message || "Project deletion failed. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen px-4 py-10 text-slate-300">
        <main className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
          Loading project details...
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen px-4 py-10 text-slate-100">
        <main className="mx-auto max-w-4xl">
          <FeedbackMessage>{loadError}</FeedbackMessage>
          <Link
            to="/projects/me"
            className="mt-5 inline-flex rounded-lg border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to My Projects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100 md:py-12">
      <main className="mx-auto max-w-5xl">
        <section className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200/80">
              Project workspace
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-normal text-white">
              Edit Project
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Keep your project brief accurate so the right collaborators know
              what you are building and which roles are still needed.
            </p>
          </div>

          <Link
            to="/projects/me"
            className="w-fit rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-300/15"
          >
            Back to My Projects
          </Link>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-slate-900/82 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur sm:p-7"
          >
            <div className="grid gap-5">
              <Field id="project-title" label="Project title">
                <input
                  id="project-title"
                  type="text"
                  name="title"
                  placeholder="Project title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isBusy}
                  required
                  className={inputClass}
                />
              </Field>

              <Field
                id="project-description"
                label="Description"
                helper="Write the problem, scope, and what kind of help you need."
              >
                <textarea
                  id="project-description"
                  name="description"
                  placeholder="Project description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isBusy}
                  required
                  rows="6"
                  className={`${inputClass} resize-y`}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  id="project-tech-stack"
                  label="Tech stack"
                  helper="Comma-separated technologies."
                >
                  <input
                    id="project-tech-stack"
                    type="text"
                    name="techStack"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.techStack}
                    onChange={handleChange}
                    disabled={isBusy}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="project-roles-needed"
                  label="Roles needed"
                  helper="Comma-separated project roles."
                >
                  <input
                    id="project-roles-needed"
                    type="text"
                    name="rolesNeeded"
                    placeholder="Frontend Developer, UI Designer"
                    value={formData.rolesNeeded}
                    onChange={handleChange}
                    disabled={isBusy}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field id="project-type" label="Project type">
                  <select
                    id="project-type"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    disabled={isBusy}
                    className={inputClass}
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="project-status" label="Project status">
                  <select
                    id="project-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isBusy}
                    className={inputClass}
                  >
                    {projectStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                id="project-repo-link"
                label="Repository link"
                helper="Optional. Use a full URL such as https://github.com/..."
              >
                <input
                  id="project-repo-link"
                  type="url"
                  name="repoLink"
                  placeholder="https://github.com/user/repo"
                  value={formData.repoLink}
                  onChange={handleChange}
                  disabled={isBusy}
                  className={inputClass}
                />
              </Field>

              {(error || success) && (
                <div aria-live="polite">
                  {error && <FeedbackMessage>{error}</FeedbackMessage>}
                  {success && (
                    <FeedbackMessage type="success">{success}</FeedbackMessage>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-950/25 transition hover:-translate-y-0.5 hover:from-sky-400 hover:to-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/20 active:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-300 disabled:shadow-none"
                >
                  {saving ? "Saving changes..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="inline-flex justify-center rounded-xl border border-rose-300/25 bg-rose-500/10 px-5 py-3 font-semibold text-rose-100 transition hover:border-rose-200/40 hover:bg-rose-500/18 hover:text-white focus:outline-none focus:ring-4 focus:ring-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Deleting project..." : "Delete Project"}
                </button>
              </div>
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/25 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Publishing status
            </p>
            <div
              className={`mt-4 rounded-xl border px-4 py-3 ${
                formData.status === "closed"
                  ? "border-rose-300/25 bg-rose-500/10 text-rose-100"
                  : "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
              }`}
            >
              <p className="text-sm font-semibold capitalize">
                {formData.status}
              </p>
              <p className="mt-1 text-xs leading-5 opacity-85">
                {formData.status === "closed"
                  ? "Closed projects stay visible in My Projects but are not open for new exploration."
                  : "Open projects can appear in Explore Projects for potential teammates."}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Deleting a project permanently removes it from your project list.
              Use that action only when the project should no longer exist.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default EditProject;

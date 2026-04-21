import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProjectById, updateProject } from "../services/projectServices";

const projectTypes = ["personal", "startup", "hackathon", "open-source"];
const projectStatuses = ["open", "closed"];

function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    techRoles: "",
    projectType: "personal",
    repoLink: "",
    status: "open",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Existing project data is fetched from the exact backend route:
        // GET /api/v1/projects/:projectId
        const response = await getProjectById(projectId);
        const project = response.data;
        const roles = project.techRoles || project.rolesNeeded || [];

        // The form is prefilled with the current project values. Arrays are
        // shown as comma-separated strings because that is easier to edit.
        setFormData({
          title: project.title || "",
          description: project.description || "",
          techStack: (project.techStack || []).join(", "),
          techRoles: roles.join(", "),
          projectType: project.projectType || "personal",
          repoLink: project.repoLink || "",
          status: project.status || "open",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load project details."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const splitToArray = (value) => {
    // Comma-separated UI values are converted into trimmed string arrays before
    // sending the PATCH payload to the backend.
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const buildPayload = () => {
    const techStack = splitToArray(formData.techStack);
    const roleList = splitToArray(formData.techRoles);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      techStack,
      techRoles: roleList,
      projectType: formData.projectType,
      repoLink: formData.repoLink.trim(),
      status: formData.status,
    };

    // PATCH payload uses the exact backend field names. rolesNeeded is only
    // included when non-empty because the backend validator rejects [].
    if (roleList.length > 0) {
      payload.rolesNeeded = roleList;
    }

    return payload;
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
      setSuccess("Project updated successfully.");

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

  if (pageLoading) {
    return (
      <div className="min-h-screen px-4 py-8 text-slate-300">
        <main className="mx-auto max-w-3xl">Loading project details...</main>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen px-4 py-8 text-red-300">
        <main className="mx-auto max-w-3xl">{error}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Projects</p>
            <h1 className="text-3xl font-bold text-white">Edit Project</h1>
          </div>

          <Link
            to="/projects/me"
            className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to My Projects
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur"
        >
          <div className="grid gap-4">
            <input
              type="text"
              name="title"
              placeholder="Project title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <textarea
              name="description"
              placeholder="Project description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <input
              type="text"
              name="techStack"
              placeholder="Tech stack, separated by commas"
              value={formData.techStack}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <input
              type="text"
              name="techRoles"
              placeholder="Tech roles / roles needed, separated by commas"
              value={formData.techRoles}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              type="url"
              name="repoLink"
              placeholder="Repository link"
              value={formData.repoLink}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          {success && <p className="mt-4 text-sm text-green-300">{success}</p>}
        </form>
      </main>
    </div>
  );
}

export default EditProject;

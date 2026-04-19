import { useState } from "react";
import { Link } from "react-router-dom";
import { createProject } from "../services/projectServices";

const projectTypes = ["personal", "startup", "hackathon", "open-source"];

function CreateProject() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    techRoles: "",
    projectType: "personal",
    repoLink: "",
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

  const splitToArray = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const projectData = {
      title: formData.title,
      description: formData.description,
      techStack: splitToArray(formData.techStack),
      techRoles: splitToArray(formData.techRoles),
      projectType: formData.projectType,
      repoLink: formData.repoLink,
    };

    try {
      await createProject(projectData);
      setSuccess("Project created successfully.");
      setFormData({
        title: "",
        description: "",
        techStack: "",
        techRoles: "",
        projectType: "personal",
        repoLink: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Project creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Projects</p>
            <h1 className="text-3xl font-bold">Create Project</h1>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-white"
          >
            Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4">
            <input
              type="text"
              name="title"
              placeholder="Project title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <textarea
              name="description"
              placeholder="Project description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <input
              type="text"
              name="techStack"
              placeholder="Tech stack, separated by commas"
              value={formData.techStack}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <input
              type="text"
              name="techRoles"
              placeholder="Roles needed, separated by commas"
              value={formData.techRoles}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="url"
              name="repoLink"
              placeholder="Repository link"
              value={formData.repoLink}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        </form>
      </main>
    </div>
  );
}

export default CreateProject;

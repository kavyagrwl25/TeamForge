import { useState } from "react";
import { Link } from "react-router-dom";
import { createProject } from "../services/projectServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

const projectTypes = ["personal", "startup", "hackathon", "open-source"];

function CreateProject() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    rolesNeeded: "",
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
      title: formData.title.trim(),
      description: formData.description.trim(),
      techStack: splitToArray(formData.techStack),
      rolesNeeded: splitToArray(formData.rolesNeeded),
      projectType: formData.projectType,
      repoLink: formData.repoLink.trim(),
    };

    try {
      await createProject(projectData);
      setSuccess("Project created successfully.");
      setFormData({
        title: "",
        description: "",
        techStack: "",
        rolesNeeded: "",
        projectType: "personal",
        repoLink: "",
      });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Project creation failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Projects</p>
            <h1 className="text-3xl font-bold text-white">Create Project</h1>
          </div>

          <Link
            to="/projects/explore"
            className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Explore Projects
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
              name="rolesNeeded"
              placeholder="Roles needed, separated by commas"
              value={formData.rolesNeeded}
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
              disabled={loading}
              className="rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
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

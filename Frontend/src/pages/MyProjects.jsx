import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { getMyProjects } from "../services/projectServices";

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getMyProjects();
        setProjects(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load your projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Projects</p>
            <h1 className="text-3xl font-bold">My Projects</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/projects/create"
              className="rounded-lg bg-slate-900 px-4 py-2 text-center font-medium text-white transition hover:bg-slate-700"
            >
              Create Project
            </Link>
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-white"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {loading && <p className="text-slate-600">Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-slate-600 shadow-sm">
            You have not created any projects yet.
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              action={
                <Link
                  to={`/projects/${project._id}/requests`}
                  className="inline-block rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                >
                  View Requests
                </Link>
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyProjects;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JoinRequestModal from "../components/JoinRequestModal";
import ProjectCard from "../components/ProjectCard";
import { getExploreProjects } from "../services/projectServices";

function ExploreProjects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getExploreProjects();
        setProjects(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load projects to explore."
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
            <h1 className="text-3xl font-bold">Explore Projects</h1>
          </div>

          <Link
            to="/projects/create"
            className="rounded-lg bg-slate-900 px-4 py-2 text-center font-medium text-white transition hover:bg-slate-700"
          >
            Create Project
          </Link>
        </div>

        {loading && <p className="text-slate-600">Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-slate-600 shadow-sm">
            No open projects are available right now.
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              action={
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                >
                  Request to Join
                </button>
              }
            />
          ))}
        </div>
      </main>

      {selectedProject && (
        <JoinRequestModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default ExploreProjects;

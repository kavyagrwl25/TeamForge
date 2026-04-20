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
        // API call for the main Explore Projects screen: GET /api/v1/projects
        const response = await getExploreProjects();
        setProjects(Array.isArray(response.data) ? response.data : []);
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#eef4ff] to-white px-4 py-10 text-slate-900 md:py-12">
      {/* Background styling: the page now uses a visible blue-white gradient instead of a mostly gray surface. */}
      <main className="relative mx-auto max-w-5xl">
        {/* Layout spacing: the intro area gives the page a stronger top section before the project list starts. */}
        <section className="mb-8 border-b border-blue-200/70 pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Project discovery
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                Explore Projects
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Discover exciting projects and connect with collaborators who
                are ready to build.
              </p>
            </div>

            <Link
              to="/projects/create"
              className="w-fit rounded-lg bg-slate-900 px-5 py-3 text-center font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              Create Project
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-blue-100 bg-white/85 px-4 py-3 shadow-sm shadow-blue-100/60 backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">
                Open collaborations
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Find teams looking for builders.
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white/85 px-4 py-3 shadow-sm shadow-blue-100/60 backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">
                Skill-based matches
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Scan tech stacks before requesting.
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white/85 px-4 py-3 shadow-sm shadow-blue-100/60 backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">
                Clear next step
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Send a join request when a project fits.
              </p>
            </div>
          </div>
        </section>

        {loading && (
          <div className="rounded-lg border border-blue-100 bg-white/90 p-6 text-slate-600 shadow-sm shadow-blue-100/70 backdrop-blur">
            Loading projects...
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          // Empty state UI: a focused panel with an icon, helpful copy, and a clear action keeps blank screens useful.
          <section className="mx-auto flex max-w-2xl flex-col items-center rounded-lg border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-200/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
              <svg
                aria-hidden="true"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11v4m-2-2h4"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              No open projects yet
            </h2>
            <p className="mt-3 max-w-md text-slate-600">
              Start by creating a project or check back later for new
              collaborations.
            </p>
            <Link
              to="/projects/create"
              className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              Create Project
            </Link>
          </section>
        )}

        <div className="grid gap-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={project?._id || index}
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

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginationComponent from "../components/Pagination";
import ProjectCard from "../components/ProjectCard";
import { getMyProjects } from "../services/projectServices";

function MyProjects() {
  const limit = 5;
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");

      try {
        // API call for projects created by the logged-in user: GET /api/v1/projects/me
        const response = await getMyProjects({
          page,
          limit,
          search: debouncedSearchTerm,
        });
        const payload = response?.data;

        setProjects(Array.isArray(payload?.allProjects) ? payload.allProjects : []);
        setTotalPages(
          Number.isInteger(payload?.pagination?.totalPages) &&
            payload.pagination.totalPages > 0
            ? payload.pagination.totalPages
            : 1
        );
      } catch (err) {
        setProjects([]);
        setTotalPages(1);
        setError(
          err.response?.data?.message || "Could not load your projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, limit, debouncedSearchTerm]);

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Projects</p>
            <h1 className="text-3xl font-bold text-white">My Projects</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your projects"
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-72"
            />
            <Link
              to="/projects/create"
              className="rounded-lg bg-sky-500 px-4 py-2 text-center font-medium text-white transition hover:bg-sky-400"
            >
              Create Project
            </Link>
            <Link
              to="/projects/explore"
              className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Explore Projects
            </Link>
          </div>
        </div>

        {loading && <p className="text-slate-300">Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/30">
            {debouncedSearchTerm
              ? "No projects found."
              : "You have not created any projects yet."}
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={project?._id || index}
              project={project}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={`/projects/${project._id}/edit`}
                    className="inline-block rounded-lg border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${project._id}/requests`)}
                    className="inline-block rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition hover:bg-sky-400"
                  >
                    View Requests
                  </button>
                </div>
              }
            />
          ))}
        </div>

        <PaginationComponent
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

export default MyProjects;

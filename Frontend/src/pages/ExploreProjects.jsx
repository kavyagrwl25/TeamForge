import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JoinRequestModal from "../components/JoinRequestModal";
import ProjectCard from "../components/ProjectCard";
import { getExploreProjects } from "../services/projectServices";
import { getMySentRequests } from "../services/requestServices";

const normalizeRequestsPayload = (response) => {
  const payload = response?.data?.data;
  const requests = Array.isArray(payload?.liveRequests)
    ? payload.liveRequests
    : Array.isArray(payload?.requests)
      ? payload.requests
      : [];

  return {
    requests,
    totalPages:
      Number.isInteger(payload?.pagination?.totalPages) &&
      payload.pagination.totalPages > 0
        ? payload.pagination.totalPages
        : 1,
  };
};

const buildStatusByProjectId = (requests) => {
  const statusByProjectId = {};

  requests.forEach((request) => {
    const projectId = request?.project?._id || request?.project;

    if (!projectId || !request?.status) {
      return;
    }

    statusByProjectId[String(projectId)] = request.status;
  });

  return statusByProjectId;
};

function ExploreProjects() {
  const [projects, setProjects] = useState([]);
  const [statusByProjectId, setStatusByProjectId] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExploreData = async () => {
      setError("");

      try {
        const [projectsResponse, firstRequestsResponse] = await Promise.all([
          getExploreProjects(),
          getMySentRequests(1),
        ]);
        const firstRequestsPage = normalizeRequestsPayload(firstRequestsResponse);
        let allRequests = firstRequestsPage.requests;

        if (firstRequestsPage.totalPages > 1) {
          const remainingPageResponses = await Promise.all(
            Array.from(
              { length: firstRequestsPage.totalPages - 1 },
              (_, index) => getMySentRequests(index + 2)
            )
          );

          const remainingRequests = remainingPageResponses.flatMap((response) =>
            normalizeRequestsPayload(response).requests
          );

          allRequests = [...allRequests, ...remainingRequests];
        }

        setProjects(
          Array.isArray(projectsResponse.data) ? projectsResponse.data : []
        );
        setStatusByProjectId(buildStatusByProjectId(allRequests));
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load projects to explore."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  const getRequestStatusLabel = (status) => {
    // Status is derived from the matching sent request returned by
    // GET /api/v1/requests/me.
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const getRequestStatusClass = (status) => {
    if (status === "accepted") {
      return "cursor-not-allowed rounded-lg bg-emerald-500/15 px-4 py-2 font-medium text-emerald-300";
    }

    if (status === "rejected") {
      return "cursor-not-allowed rounded-lg bg-red-500/15 px-4 py-2 font-medium text-red-300";
    }

    return "cursor-not-allowed rounded-lg bg-amber-500/15 px-4 py-2 font-medium text-amber-300";
  };

  const handleOpenRequestModal = (project) => {
    const projectId = String(project?._id || "");

    if (statusByProjectId[projectId]) {
      setError("You have already sent request to this project.");
      return;
    }

    setError("");
    setSelectedProject(project);
  };

  const handleRequestCreated = (request) => {
    const projectId =
      request?.project?._id || request?.project || selectedProject?._id;

    if (projectId) {
      setStatusByProjectId((prev) => ({
        ...prev,
        [String(projectId)]: "pending",
      }));
    }

    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100 md:py-12">
      {/* Page wrapper stays transparent so the root dark gradient remains consistent on every route. */}
      <main className="relative mx-auto max-w-5xl">
        {/* Layout spacing: the intro area gives the page a stronger top section before the project list starts. */}
        <section className="mb-8 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Project discovery
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
                Explore Projects
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300">
                Discover exciting projects and connect with collaborators who
                are ready to build.
              </p>
            </div>

            <Link
              to="/projects/create"
              className="w-fit rounded-lg bg-sky-500 px-5 py-3 text-center font-medium text-white shadow-sm transition hover:bg-sky-400"
            >
              Create Project
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur">
              <p className="text-sm font-semibold text-white">
                Open collaborations
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Find teams looking for builders.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur">
              <p className="text-sm font-semibold text-white">
                Skill-based matches
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Scan tech stacks before requesting.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur">
              <p className="text-sm font-semibold text-white">
                Clear next step
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Send a join request when a project fits.
              </p>
            </div>
          </div>
        </section>

        {loading && (
          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/30 backdrop-blur">
            Loading projects...
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          // Empty state UI: a focused panel with an icon, helpful copy, and a clear action keeps blank screens useful.
          <section className="mx-auto flex max-w-2xl flex-col items-center rounded-lg border border-white/10 bg-slate-900/85 px-6 py-12 text-center shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-white">
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
            <h2 className="mt-5 text-2xl font-bold text-white">
              No open projects yet
            </h2>
            <p className="mt-3 max-w-md text-slate-300">
              Start by creating a project or check back later for new
              collaborations.
            </p>
            <Link
              to="/projects/create"
              className="mt-6 rounded-lg bg-sky-500 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-sky-400"
            >
              Create Project
            </Link>
          </section>
        )}

        <div className="grid gap-4">
          {projects.map((project, index) => {
            const projectId = String(project?._id || "");
            const existingStatus = statusByProjectId[projectId];

            return (
              <ProjectCard
                key={project?._id || index}
                project={project}
                action={
                  existingStatus ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled
                        className={getRequestStatusClass(existingStatus)}
                      >
                        {getRequestStatusLabel(existingStatus)}
                      </button>
                      <p className="text-sm text-slate-400">
                        You have already sent a request for this project.
                      </p>
                    </div>
                  ) : (
                    // Disabled state is applied only when the current project
                    // has a matching sent request. Otherwise the modal still opens.
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(project)}
                      className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition hover:bg-sky-400"
                    >
                      Request to Join
                    </button>
                  )
                }
              />
            );
          })}
        </div>
      </main>

      {selectedProject && (
        <JoinRequestModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRequestCreated={handleRequestCreated}
          existingRequestStatus={
            statusByProjectId[String(selectedProject?._id || "")]
          }
        />
      )}
    </div>
  );
}

export default ExploreProjects;

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import { API } from "../services/authServices";
import { updateRequestStatus } from "../services/requestServices";

function RequesterProfileModal({ request, requester, getInitials, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="requester-profile-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-slate-100 shadow-2xl shadow-slate-950/70 ring-1 ring-cyan-300/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-xl font-bold text-slate-950 shadow-lg shadow-cyan-950/25">
              {getInitials(requester)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-wide text-cyan-200/80">
                Requester profile
              </p>
              <h2
                id="requester-profile-title"
                className="mt-1 truncate text-2xl font-bold text-white"
              >
                {requester.fullName || "Unknown user"}
              </h2>
              <p className="mt-1 truncate text-sm text-slate-400">
                @{requester.userName || "unknown"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-300/15"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-slate-400">Email</p>
              <p className="mt-1 break-words text-slate-100">
                {requester.email || "No email available"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-slate-400">
                Role Requested
              </p>
              <p className="mt-1 text-slate-100">
                {request.roleRequested || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-slate-400">
                Pitch Message
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-7 text-slate-100">
                {request.pitchMessage || "No pitch message provided."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

function ProjectRequests() {
  const { projectId } = useParams();
  const limit = 5;

  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setError("");
      setLoading(true);

      if (!projectId) {
        setRequests([]);
        setError("Could not load project requests. Missing project id.");
        setLoading(false);
        return;
      }

      try {
        console.log("projectId:", projectId);
        const response = await API.get(`/requests/project/${projectId}`, {
          params: {
            page: currentPage,
            limit,
          },
        });
        console.log("Project requests API response:", response);
        console.log("Project requests response.data:", response.data);

        const payload = response.data?.data;
        const requestsArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.requests)
            ? payload.requests
            : [];

        setRequests(requestsArray);
        setTotalPages(
          Number.isInteger(payload?.totalPages) && payload.totalPages > 0
            ? payload.totalPages
            : 1
        );
      } catch (err) {
        setRequests([]);
        setTotalPages(1);
        setError(
          err.response?.data?.message || "Could not load project requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [projectId, currentPage, limit]);

  const handleStatusUpdate = async (requestId, status) => {
    setError("");
    setSuccess("");
    setUpdatingId(requestId);

    try {
      const response = await updateRequestStatus(requestId, { status });

      setRequests((prev) =>
        Array.isArray(prev)
          ? prev.map((request) =>
              request._id === requestId ? response.data : request
            )
          : []
      );
      setSuccess(`Request ${status} successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update request status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getInitials = (user) => {
    const name = user?.fullName || user?.userName || user?.email || "User";
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return words[0]?.slice(0, 2).toUpperCase() || "U";
  };

  const getStatusBadgeClass = (status) => {
    if (status === "accepted") {
      return "bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm";
    }

    if (status === "rejected") {
      return "bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm";
    }

    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-sm";
  };

  const selectedRequester = selectedRequest?.requestedBy || {};
  const safeRequests = Array.isArray(requests) ? requests : [];

  useEffect(() => {
    if (!selectedRequest) {
      return;
    }

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedRequest(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRequest]);

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Requests</p>
            <h1 className="text-3xl font-bold text-white">Project Requests</h1>
          </div>

          <Link
            to="/projects/me"
            className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to My Projects
          </Link>
        </div>

        {loading && <p className="text-slate-300">Loading requests...</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-600">{success}</p>}

        {!loading && !error && safeRequests.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/30">
            No join requests yet. When collaborators apply to this project,
            their requests will appear here.
          </div>
        )}

        <div className="grid gap-4">
          {safeRequests.map((request) => (
            <article
              key={request._id}
              className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                    {getInitials(request.requestedBy)}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="text-left text-xl font-bold text-white transition hover:text-sky-300"
                    >
                      {request.requestedBy?.fullName || "Unknown user"}
                    </button>
                    <p className="mt-1 text-sm text-slate-400">
                      @{request.requestedBy?.userName || "unknown"} -{" "}
                      {request.requestedBy?.email || "No email"}
                    </p>
                  </div>
                </div>

                <span className={`${getStatusBadgeClass(request.status)} w-fit font-medium capitalize`}>
                  {request.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-white">Role:</span>{" "}
                  {request.roleRequested || "Not provided"}
                </p>
              </div>

              <p className="mt-4 text-slate-300">
                <span className="font-semibold text-white">Pitch:</span>{" "}
                {request.pitchMessage || "No pitch message provided."}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {/* Profile preview uses only the requester data already included in this request response. */}
                <button
                  type="button"
                  onClick={() => setSelectedRequest(request)}
                  className="rounded-lg border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  View Profile
                </button>

                {request.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(request._id, "accepted")
                      }
                      disabled={updatingId === request._id}
                      className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusUpdate(request._id, "rejected")
                      }
                      disabled={updatingId === request._id}
                      className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>

      {selectedRequest && (
        <RequesterProfileModal
          request={selectedRequest}
          requester={selectedRequester}
          getInitials={getInitials}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

export default ProjectRequests;

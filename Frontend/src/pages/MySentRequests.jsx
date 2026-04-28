import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PaginationComponent from "../components/Pagination";
import {
  deleteRequest,
  getMySentRequests,
} from "../services/requestServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

function MySentRequests() {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");

      try {
        // API call for requests sent by the logged-in user:
        // GET /api/v1/requests/me?page=${page}&limit=10
        const response = await getMySentRequests(page);
        const liveRequests = Array.isArray(response.data.data.liveRequests)
          ? response.data.data.liveRequests
          : [];

        setRequests(liveRequests);
        setPagination(response.data.data.pagination || null);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Could not load your sent requests.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page]);

  const handleDelete = async (requestId) => {
    setError("");
    setSuccess("");
    setDeletingId(requestId);

    try {
      await deleteRequest(requestId);
      const isOnlyRequestOnPage = requests.length === 1;

      if (isOnlyRequestOnPage && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );
      }

      setSuccess("Request deleted successfully.");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not delete request. Please try again.")
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Requests</p>
            <h1 className="text-3xl font-bold text-white">My Sent Requests</h1>
          </div>

          <Link
            to="/projects/explore"
            className="rounded-lg border border-white/10 px-4 py-2 text-center font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Explore Projects
          </Link>
        </div>

        {loading && <p className="text-slate-300">Loading requests...</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-600">{success}</p>}

        {!loading && !error && requests.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/30">
            <h2 className="text-xl font-bold text-white">No active sent requests</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              You have not sent any join requests yet, or the projects you
              requested to join are no longer available.
            </p>
            <Link
              to="/projects/explore"
              className="mt-5 inline-flex rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition hover:bg-sky-400"
            >
              Explore Projects
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {requests.map((request, index) => (
            <article key={request?._id || index} className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {request.project.title || "Untitled project"}
                  </h2>
                  <p className="mt-2 text-slate-300">
                    {request.project.description || "No description available."}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-sm font-medium capitalize text-slate-300">
                  {request.status || "status unavailable"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-white">Role:</span>{" "}
                  {request.roleRequested || "Not provided"}
                </p>
                {request.createdAt && (
                  <p>
                    <span className="font-semibold text-white">Sent:</span>{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <p className="mt-4 text-slate-300">
                <span className="font-semibold text-white">Pitch:</span>{" "}
                {request.pitchMessage || "No pitch message provided."}
              </p>

              {request.status !== "accepted" && (
                <button
                  type="button"
                  onClick={() => handleDelete(request._id)}
                  disabled={deletingId === request._id}
                  className="mt-5 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {deletingId === request._id ? "Deleting..." : "Delete Request"}
                </button>
              )}
            </article>
          ))}
        </div>

        <PaginationComponent
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

export default MySentRequests;

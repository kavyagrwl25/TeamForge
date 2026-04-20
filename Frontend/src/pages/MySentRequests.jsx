import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteRequest,
  getMySentRequests,
} from "../services/requestServices";

function MySentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // API call for requests sent by the logged-in user: GET /api/v1/requests/me
        const response = await getMySentRequests();
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load your sent requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (requestId) => {
    setError("");
    setSuccess("");
    setDeletingId(requestId);

    try {
      await deleteRequest(requestId);
      setRequests((prev) => prev.filter((request) => request._id !== requestId));
      setSuccess("Request deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete request. Please try again."
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Requests</p>
            <h1 className="text-3xl font-bold">My Sent Requests</h1>
          </div>

          <Link
            to="/projects/explore"
            className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-white"
          >
            Explore Projects
          </Link>
        </div>

        {loading && <p className="text-slate-600">Loading requests...</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-600">{success}</p>}

        {!loading && !error && requests.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-slate-600 shadow-sm">
            You have not sent any join requests yet.
          </div>
        )}

        <div className="grid gap-4">
          {requests.map((request, index) => (
            <article key={request?._id || index} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {request.project?.title || "Project unavailable"}
                  </h2>
                  <p className="mt-2 text-slate-600">
                    {request.project?.description || "No description available."}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
                  {request.status || "status unavailable"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-800">Role:</span>{" "}
                  {request.roleRequested || "Not provided"}
                </p>
                {request.createdAt && (
                  <p>
                    <span className="font-semibold text-slate-800">Sent:</span>{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <p className="mt-4 text-slate-600">
                <span className="font-semibold text-slate-800">Pitch:</span>{" "}
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
      </main>
    </div>
  );
}

export default MySentRequests;

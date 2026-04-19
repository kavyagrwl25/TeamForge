import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getRequestsForProject,
  updateRequestStatus,
} from "../services/requestServices";

function ProjectRequests() {
  const { projectId } = useParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getRequestsForProject(projectId);
        setRequests(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load project requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [projectId]);

  const handleStatusUpdate = async (requestId, status) => {
    setError("");
    setSuccess("");
    setUpdatingId(requestId);

    try {
      const response = await updateRequestStatus(requestId, { status });

      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId ? response.data : request
        )
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

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Requests</p>
            <h1 className="text-3xl font-bold">Project Requests</h1>
          </div>

          <Link
            to="/projects/me"
            className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-white"
          >
            Back to My Projects
          </Link>
        </div>

        {loading && <p className="text-slate-600">Loading requests...</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-600">{success}</p>}

        {!loading && !error && requests.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-slate-600 shadow-sm">
            No join requests for this project yet.
          </div>
        )}

        <div className="grid gap-4">
          {requests.map((request) => (
            <article key={request._id} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {request.requestedBy?.fullName || "Unknown user"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    @{request.requestedBy?.userName || "unknown"} -{" "}
                    {request.requestedBy?.email || "No email"}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700">
                  {request.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-800">Role:</span>{" "}
                  {request.roleRequested || "Not provided"}
                </p>
              </div>

              <p className="mt-4 text-slate-600">
                <span className="font-semibold text-slate-800">Pitch:</span>{" "}
                {request.pitchMessage || "No pitch message provided."}
              </p>

              {request.status === "pending" && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(request._id, "accepted")}
                    disabled={updatingId === request._id}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(request._id, "rejected")}
                    disabled={updatingId === request._id}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ProjectRequests;

import { useState } from "react";
import ErrorAlert from "./ErrorAlert";
import { createJoinRequest } from "../services/requestServices";
import { getApiErrorMessage } from "../utils/apiErrorHelpers";

function JoinRequestModal({
  project,
  onClose,
  onRequestCreated,
  existingRequestStatus,
}) {
  const [formData, setFormData] = useState({
    roleRequested: "",
    pitchMessage: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (existingRequestStatus) {
      setError("You have already sent request to this project.");
      return;
    }

    if (!formData.roleRequested.trim()) {
      setError("Please enter the role you want to request.");
      return;
    }

    setLoading(true);

    try {
      const response = await createJoinRequest(project._id, {
        roleRequested: formData.roleRequested,
        pitchMessage: formData.pitchMessage,
      });

      onRequestCreated?.(response.data);
      setSuccess("Request sent successfully.");
      setFormData({
        roleRequested: "",
        pitchMessage: "",
      });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not send request. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-slate-950/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">Join request</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="text"
            name="roleRequested"
            placeholder="Role requested"
            value={formData.roleRequested}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <textarea
            name="pitchMessage"
            placeholder="Pitch message"
            value={formData.pitchMessage}
            onChange={handleChange}
            rows="4"
            className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>

        {error && <ErrorAlert className="mt-4">{error}</ErrorAlert>}
        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
      </div>
    </div>
  );
}

export default JoinRequestModal;

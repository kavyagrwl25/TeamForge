import { useState } from "react";
import { createJoinRequest } from "../services/requestServices";

function JoinRequestModal({ project, onClose }) {
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

    if (!formData.roleRequested.trim()) {
      setError("Please enter the role you want to request.");
      return;
    }

    setLoading(true);

    try {
      await createJoinRequest(project._id, {
        roleRequested: formData.roleRequested,
        pitchMessage: formData.pitchMessage,
      });

      setSuccess("Request sent successfully.");
      setFormData({
        roleRequested: "",
        pitchMessage: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Join request</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <textarea
            name="pitchMessage"
            placeholder="Pitch message"
            value={formData.pitchMessage}
            onChange={handleChange}
            rows="4"
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
      </div>
    </div>
  );
}

export default JoinRequestModal;

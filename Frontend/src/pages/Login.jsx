import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authServices";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      setLoading(true);

      const data = await loginUser(formData);

      console.log("Login response:", data);

      // reset form
      setFormData({
        email: "",
        password: "",
      });

      // redirect after login
      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Login to TeamForge
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
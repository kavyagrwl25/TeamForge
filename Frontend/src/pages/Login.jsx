import { createElement, useRef, useState } from "react";
import ErrorAlert from "../components/ErrorAlert";
import { Link, useNavigate } from "react-router-dom";
import {
  clearAuthSessionHint,
  getCurrentUser,
  loginUser,
} from "../services/authServices";
import {
  getApiErrorMessage,
  getLoginErrorMessage,
} from "../utils/apiErrorHelpers";

const featureChips = [
  "Discover projects",
  "Find skilled teammates",
  "Collaborate and ship faster",
];

function MailIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.1 12s3.4-6.5 9.9-6.5S21.9 12 21.9 12 18.5 18.5 12 18.5 2.1 12 2.1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.5 5.8A10 10 0 0 1 12 5.5c6.5 0 9.9 6.5 9.9 6.5a16.7 16.7 0 0 1-2.4 3.3" />
      <path d="M6.4 6.9C3.6 8.8 2.1 12 2.1 12s3.4 6.5 9.9 6.5a10 10 0 0 0 4.2-.9" />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function FeatureChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-cyan-50 shadow-sm shadow-sky-950/20 backdrop-blur transition hover:border-cyan-200/35 hover:bg-white/[0.11] sm:text-sm">
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.75)]" />
      {children}
    </span>
  );
}

function ProductPreviewCard() {
  return (
    <div className="relative mt-10 max-w-md rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/80">
            Open role
          </p>
          <h3 className="mt-2 text-base font-semibold text-white">
            Frontend Developer needed
          </h3>
          <p className="mt-1 text-sm text-slate-300">MERN Startup Project</p>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
          Active
        </span>
      </div>

      <div className="relative mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-white/10 bg-slate-900/55 p-4">
          <div className="flex -space-x-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-900 bg-sky-400 text-xs font-bold text-slate-950">
              JS
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-900 bg-cyan-200 text-xs font-bold text-slate-950">
              UI
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-900 bg-indigo-300 text-xs font-bold text-slate-950">
              API
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Matched teammates ready to review the project brief.
          </p>
        </div>

        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-left sm:min-w-32">
          <p className="text-3xl font-bold text-white">2</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100/80">
            requests pending
          </p>
        </div>
      </div>
    </div>
  );
}

function TextInput({ icon, id, label, className = "", ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        {createElement(icon, {
          className:
            "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500",
        })}
        <input
          id={id}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full rounded-xl border border-white/10 bg-slate-950/65 px-4 py-3 pl-12 text-slate-100 shadow-inner shadow-slate-950/30 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-cyan-300/70 focus:bg-slate-950/80 focus:ring-4 focus:ring-cyan-300/15 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, disabled }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          name="password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          className="w-full rounded-xl border border-white/10 bg-slate-950/65 px-4 py-3 pl-12 pr-12 text-slate-100 shadow-inner shadow-slate-950/30 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-cyan-300/70 focus:bg-slate-950/80 focus:ring-4 focus:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function AuthCard({ children }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-cyan-300/30 via-sky-500/10 to-indigo-500/25 opacity-70 blur-xl" />
      <div className="relative rounded-[1.5rem] border border-white/12 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur-2xl sm:p-8">
        {children}
      </div>
    </div>
  );
}

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

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

    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setError("");
    setLoading(true);
    let loginSucceeded = false;

    try {
      const loginResponse = await loginUser(formData);
      loginSucceeded = true;
      console.log("login status", loginResponse?.status ?? null);

      const currentUserResponse = await getCurrentUser({
        skipAuthRefresh: true,
      });
      console.log("/users/me status", 200);

      const sessionUser = currentUserResponse?.data;

      if (!sessionUser) {
        console.log("auth user set", false);
        throw new Error("Unable to verify your session after login.");
      }

      setError("");
      onLoginSuccess(sessionUser);
      console.log("auth user set", true);
      navigate("/projects/explore", { replace: true });
      return;
    } catch (err) {
      const status = err?.response?.status ?? null;

      if (loginSucceeded) {
        console.log("/users/me status", status);
        console.log("auth user set", false);
        clearAuthSessionHint();
        setError(
          status === 401
            ? "Login succeeded but session cookie was not stored/sent"
            : getApiErrorMessage(
                err,
                "Unable to verify your session after login."
              )
        );
      } else {
        console.log("login status", status);
        setError(
          getLoginErrorMessage(
            err,
            getApiErrorMessage(err, "Login failed. Please try again.")
          )
        );
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <section className="relative text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100 shadow-lg shadow-slate-950/20 backdrop-blur">
            Team matchmaking for builders
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-normal text-white sm:text-6xl lg:text-7xl">
            TeamForge
          </h1>
          <p className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-cyan-50 sm:text-3xl lg:mx-0">
            Build with the right people.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300 lg:mx-0">
            Find promising projects, connect with skilled developers, and keep
            collaboration moving from idea to shipped product.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            {featureChips.map((chip) => (
              <FeatureChip key={chip}>{chip}</FeatureChip>
            ))}
          </div>

          <ProductPreviewCard />
        </section>

        <section className="flex justify-center lg:justify-end">
          <AuthCard>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Login to TeamForge
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Login to continue exploring projects and collaborating with
                developers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <TextInput
                icon={MailIcon}
                id="login-email"
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="disabled:cursor-not-allowed disabled:opacity-70"
              />

              <PasswordInput
                id="login-password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              <div aria-live="polite" className="min-h-11">
                {error && (
                  <ErrorAlert>
                    {error}
                  </ErrorAlert>
                )}

                {!error && loading && (
                  <div className="flex items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.85)]" />
                    Checking your credentials...
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-300/25 active:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-700 disabled:text-slate-300 disabled:shadow-none"
              >
                {loading ? "Logging in..." : "Login"}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              New to TeamForge?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-white hover:decoration-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              >
                Create account
              </Link>
            </p>
          </AuthCard>
        </section>
      </div>
    </div>
  );
}

export default Login;

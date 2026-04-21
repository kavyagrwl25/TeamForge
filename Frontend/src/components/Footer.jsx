import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-8 text-slate-300">
      {/* Layout structure: brand, quick links, and social links sit in three columns on wider screens. */}
      {/* Responsive behavior: the grid stacks into one column on mobile for comfortable spacing. */}
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <section>
          <h2 className="text-xl font-bold text-white">TeamForge</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Find your team. Build your vision.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Quick Links
          </h3>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link
              to="/projects/explore"
              className="w-fit transition hover:text-white"
            >
              Explore Projects
            </Link>
            <Link to="/projects/me" className="w-fit transition hover:text-white">
              My Projects
            </Link>
            <Link to="/requests/me" className="w-fit transition hover:text-white">
              My Requests
            </Link>
            <Link to="/profile" className="w-fit transition hover:text-white">
              Profile
            </Link>
          </nav>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Connect with me
          </h3>
          <div className="mt-3 flex flex-col gap-3 text-sm sm:flex-row md:flex-col">
            {/* External links open in a new tab and use noopener/noreferrer for safer browsing. */}
            {/* Button styling: rounded border buttons with icon, color, and scale hover effects. */}
            <a
              href="https://github.com/kavyagrwl25"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:scale-105 hover:border-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.72.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.97c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.8c0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/kavya-agrawal-a097402a1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:scale-105 hover:border-blue-400 hover:bg-blue-500 hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.4h4v11.1H3V9.4Zm6.15 0h3.83v1.52h.05c.53-.96 1.83-1.97 3.77-1.97 4.03 0 4.77 2.53 4.77 5.82v5.73h-4v-5.08c0-1.21-.02-2.77-1.77-2.77-1.78 0-2.05 1.32-2.05 2.69v5.16h-4V9.4Z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-800 pt-5">
        <p className="text-sm text-slate-500">
          &copy; 2026 TeamForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

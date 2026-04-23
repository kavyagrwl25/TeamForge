const statusStyles = {
  open: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  closed: "border-rose-300/25 bg-rose-500/10 text-rose-200",
};

function StatusBadge({ status }) {
  const normalizedStatus = typeof status === "string" ? status : "";
  const displayStatus = normalizedStatus || "status unavailable";
  const statusClass =
    statusStyles[normalizedStatus] ||
    "border-slate-300/20 bg-slate-500/10 text-slate-300";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {displayStatus}
    </span>
  );
}

function ExternalLinkIcon(props) {
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
      <path d="M14 4h6v6" />
      <path d="m10 14 10-10" />
      <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

function ChipList({ items, emptyLabel, variant = "default" }) {
  const chipClass =
    variant === "role"
      ? "border-sky-300/20 bg-sky-400/10 text-sky-100"
      : "border-white/10 bg-slate-950/50 text-slate-300";

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.length > 0 ? (
        items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${chipClass}`}
          >
            {item}
          </span>
        ))
      ) : (
        <span className="text-sm text-slate-500">{emptyLabel}</span>
      )}
    </div>
  );
}

function ProjectCard({ project, action }) {
  const techStack = Array.isArray(project?.techStack) ? project.techStack : [];
  const rolesNeeded = Array.isArray(project?.rolesNeeded)
    ? project.rolesNeeded
    : [];
  const creator = project?.createdBy || {};
  const creatorFullName = creator.fullName || "Unknown creator";
  const creatorUserName = creator.userName || "username unavailable";
  const isClosed = project?.status === "closed";

  return (
    <article
      className={`rounded-xl border p-5 shadow-xl shadow-slate-950/30 backdrop-blur transition ${
        isClosed
          ? "border-rose-300/15 bg-slate-950/70"
          : "border-white/10 bg-slate-900/82 hover:border-cyan-300/20"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              {project?.title || "Untitled project"}
            </h2>
            {isClosed && (
              <span className="rounded-full border border-rose-300/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-100">
                No longer accepting requests
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            By {creatorFullName}
            <span className="ml-2 text-slate-500">@{creatorUserName}</span>
          </p>
        </div>

        <StatusBadge status={project?.status} />
      </div>

      <p className={`mt-4 leading-7 ${isClosed ? "text-slate-400" : "text-slate-300"}`}>
        {project?.description || "No description available."}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-slate-950/30 p-4">
          <p className="text-sm font-semibold text-slate-200">Tech Stack</p>
          <ChipList items={techStack} emptyLabel="No tech stack listed" />
        </section>

        <section className="rounded-lg border border-white/10 bg-slate-950/30 p-4">
          <p className="text-sm font-semibold text-slate-200">Roles Needed</p>
          <ChipList
            items={rolesNeeded}
            emptyLabel="No roles listed"
            variant="role"
          />
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 capitalize text-slate-300">
          {project?.projectType || "type unavailable"}
        </span>

        {project?.repoLink ? (
          <a
            href={project.repoLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-400/10 px-3 py-2 font-medium text-sky-200 transition hover:border-sky-200/40 hover:bg-sky-400/15 hover:text-white"
          >
            Repository
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-slate-500">No repository link</span>
        )}
      </div>

      {action && (
        <div className="mt-5 border-t border-white/10 pt-4">{action}</div>
      )}
    </article>
  );
}

export default ProjectCard;

function ProjectCard({ project, action }) {
  const techStack = Array.isArray(project?.techStack) ? project.techStack : [];
  const techRoles = Array.isArray(project?.techRoles) ? project.techRoles : [];
  const rolesNeeded = Array.isArray(project?.rolesNeeded)
    ? project.rolesNeeded
    : [];
  const roles = techRoles.length > 0 ? techRoles : rolesNeeded;
  const creator = project?.createdBy || {};
  const creatorFullName = creator.fullName || "Unknown creator";
  const creatorUserName = creator.userName || "username unavailable";

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {project?.title || "Untitled project"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            By {creatorFullName}
            <span className="ml-2 text-slate-400">@{creatorUserName}</span>
          </p>
        </div>

        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-700">
          {project?.status || "status unavailable"}
        </span>
      </div>

      <p className="mt-4 text-slate-600">
        {project?.description || "No description available."}
      </p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">Tech Stack</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {techStack.length > 0 ? (
            techStack.map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {tech}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No tech stack listed</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">Roles</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {roles.length > 0 ? (
            roles.map((role, index) => (
              <span
                key={`${role}-${index}`}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No roles listed</span>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="capitalize">
          Type: {project?.projectType || "type unavailable"}
        </span>

        {project?.repoLink && (
          <a
            href={project.repoLink}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-800 underline"
          >
            Repository
          </a>
        )}
      </div>

      {action && (
        <div className="mt-5 border-t border-slate-100 pt-4">{action}</div>
      )}
    </article>
  );
}

export default ProjectCard;

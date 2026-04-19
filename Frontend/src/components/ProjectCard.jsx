function ProjectCard({ project, action }) {
  const techStack = project.techStack || [];
  const roles = project.techRoles || project.rolesNeeded || [];
  const ownerName = project.createdBy?.fullName || project.createdBy?.userName;

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          {ownerName && (
            <p className="mt-1 text-sm text-slate-500">By {ownerName}</p>
          )}
        </div>

        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-700">
          {project.status || "open"}
        </span>
      </div>

      <p className="mt-4 text-slate-600">{project.description}</p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">Tech Stack</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {techStack.length > 0 ? (
            techStack.map((tech) => (
              <span
                key={tech}
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
            roles.map((role) => (
              <span
                key={role}
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
          Type: {project.projectType || "personal"}
        </span>

        {project.repoLink && (
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

      {action && <div className="mt-5 border-t border-slate-100 pt-4">{action}</div>}
    </article>
  );
}

export default ProjectCard;

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { isValidProjectDescription, isValidProjectTitle, isValidStringArray } from "../utils/projectValidators.js";

const createProject = AsyncHandler(async (req, res) => {
    const { title, description, techStack, techRoles, projectType, repoLink } = req.body

    if (title === undefined || !isValidProjectTitle(title)) {
        throw new ApiError(400, "Invalid title")
    }

    if (description === undefined || !isValidProjectDescription(description)) {
        throw new ApiError(400, "Invalid description")
    }

    if (techStack !== undefined && !isValidStringArray(techStack)) {
        throw new ApiError(400, "Tech stack must be a valid string array")
    }

    if (techRoles !== undefined && !isValidStringArray(techRoles)) {
        throw new ApiError(400, "Tech roles must be a valid string array")
    }

    if (repoLink !== undefined && !isValidRepoLink(repoLink)) {
        throw new ApiError(400, "Invalid repository link")
    }

    const project = await Project.create({
        title: title.trim(),
        description: description.trim(),
        techStack,
        techRoles,
        projectType,
        repoLink,
        createdBy: req.user._id
    })

    const populatedProject = await Project.findById(project._id).populate(
        "createdBy",
        "fullName userName email"
    )

    return res
        .status(201)
        .json(new ApiResponse(201, populatedProject, "Project created successfully"))
})


export { createProject }

// createproject
// updateProject
// deleteProject
// getProjectById
// getAllProjects
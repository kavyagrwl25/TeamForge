import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { isValidProjectDescription, isValidProjectTitle, isValidStringArray, isValidProjectStatus, isValidProjectType, isValidRepoLink, isValidRolesNeeded } from "../utils/projectValidators.js";

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

const updateProject = AsyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, techStack, techRoles, projectType, repoLink, status, rolesNeeded } = req.body;

    if (title !== undefined && !isValidProjectTitle(title)) {
        throw new ApiError(400, "Invalid title");
    }

    if (description !== undefined && !isValidProjectDescription(description)) {
        throw new ApiError(400, "Invalid description");
    }

    if (techStack !== undefined && !isValidStringArray(techStack)) {
        throw new ApiError(400, "Tech stack must be a valid string array");
    }

    if (techRoles !== undefined && !isValidStringArray(techRoles)) {
        throw new ApiError(400, "Tech roles must be a valid string array");
    }

    if (repoLink !== undefined && !isValidRepoLink(repoLink)) {
        throw new ApiError(400, "Invalid repository link");
    }

    if (status !== undefined && !isValidProjectStatus(status)) {
        throw new ApiError(400, "Invalid status");
    }

    if (projectType !== undefined && !isValidProjectType(projectType)) {
        throw new ApiError(400, "Invalid project type");
    }

    if (rolesNeeded !== undefined && !isValidRolesNeeded(rolesNeeded)) {
        throw new ApiError(400, "Invalid roles needed");
    }

    if (
        title === undefined &&
        description === undefined &&
        techStack === undefined &&
        techRoles === undefined &&
        projectType === undefined &&
        repoLink === undefined &&
        status === undefined &&
        rolesNeeded === undefined
    ) {
        throw new ApiError(400, "Nothing to update")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this project")
    }

    const updateFields = {}

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (techStack !== undefined) updateFields.techStack = techStack;
    if (techRoles !== undefined) updateFields.techRoles = techRoles;
    if (projectType !== undefined) updateFields.projectType = projectType;
    if (repoLink !== undefined) updateFields.repoLink = repoLink;
    if (status !== undefined) updateFields.status = status;
    if (rolesNeeded !== undefined) updateFields.rolesNeeded = rolesNeeded;

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $set: updateFields },
        {
            new: true,
            runValidators: true
        }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
    )
})

export { createProject }

// createproject
// updateProject
// deleteProject
// getProjectById
// getAllProjects
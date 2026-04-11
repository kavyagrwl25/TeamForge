import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { isValidProjectDescription, isValidProjectTitle, isValidStringArray, isValidProjectStatus, isValidProjectType, isValidRepoLink, isValidRolesNeeded } from "../utils/projectValidators.js";
import mongoose from "mongoose";

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
    if (projectType !== undefined && !isValidProjectType(projectType)) {
        throw new ApiError(400, "Invalid project type")
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
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }
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

    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
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
    ).populate("createdBy", "fullName userName email").lean()

    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
    )
})

const deleteProject = AsyncHandler( async(req, res) => {
    // 1. get project id from req,params
    // 2. findOneAndUpdate with parameters- userid and projectId
    // 3. return the response
    const { projectId } = req.params
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }
    const deletedProject = await Project.findOneAndDelete({ _id: projectId, createdBy: req.user._id })         //checking authorization
    if(!deletedProject){
        throw new ApiError(404, "Project not found or unauthorized")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"))
})

const getProjectById = AsyncHandler( async(req, res) => {
    // 1. get the project id from req.params and validate it
    // 2. fetch the project from db and validate it
    // 3. return all the fields in response
    const { projectId } = req.params
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }
    const project = await Project.findById(projectId).populate(
        "createdBy",
        "fullName userName email"
    ).lean()
    if(!project){
        throw new ApiError(404, "Project not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"))
}) 

const getMyProjects = AsyncHandler( async(req, res) => {
    // 1. get the createdBy from req.user._id
    // 2. find all the projects with that createdBy in db
    // 3. return the response
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "Invalid user id")
    }
    const allProjects = await Project.find( {createdBy: userId} ).populate("createdBy",
        "fullName userName email"
    ).sort({ createdAt: -1 }).lean()
    
    return res
    .status(200)
    .json(new ApiResponse(200, allProjects, "Projects fetched successfully"))
})

const getExploreProjects = AsyncHandler( async(req, res) => {
    // 1. this is to show others projects to current user to apply in
    // 2. get userId from req.user
    // 3. get all the projects rather than the current user projects
    // 4. return the response
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "User id is invalid")
    }
    const projects = await Project.find({
        createdBy: { $ne: userId },
        status: "open"
    })
    .populate("createdBy", "fullName userName email").sort({ createdAt: -1 })
    .lean()

    return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"))
})

export { createProject, updateProject, deleteProject, getProjectById, getMyProjects, getExploreProjects }

// createproject
// updateProject
// deleteProject
// getProjectById
// getMyProjects
// getExploreProjects
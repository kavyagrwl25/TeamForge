import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { Request } from "../models/request.model.js";
import { isValidProjectDescription, isValidProjectTitle, isValidStringArray, isValidProjectStatus, isValidProjectType, isValidRepoLink, isValidRolesNeeded } from "../utils/projectValidators.js";
import mongoose from "mongoose";

const isTransactionUnsupportedError = (error) => {
    const message = error?.message?.toLowerCase() || "";

    return (
        message.includes("transaction numbers are only allowed") ||
        message.includes("replica set member or mongos") ||
        message.includes("transactions are not supported")
    );
};

const deleteProjectAndRequests = async (projectId, userId, session = null) => {
    const queryOptions = session ? { session } : {};
    let projectQuery = Project.findOne({ _id: projectId, createdBy: userId });

    if (session) {
        projectQuery = projectQuery.session(session);
    }

    const project = await projectQuery;

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized")
    }

    const deletedRequests = await Request.deleteMany(
        { project: project._id },
        queryOptions
    );

    const deletedProject = await Project.deleteOne(
        { _id: project._id, createdBy: userId },
        queryOptions
    );

    if (deletedProject.deletedCount !== 1) {
        throw new ApiError(404, "Project not found or unauthorized")
    }

    return deletedRequests.deletedCount || 0;
};

const createProject = AsyncHandler(async (req, res) => {
    const { title, description, techStack, rolesNeeded, projectType, repoLink } = req.body

    if (title === undefined || !isValidProjectTitle(title)) {
        throw new ApiError(400, "Invalid title")
    }

    if (description === undefined || !isValidProjectDescription(description)) {
        throw new ApiError(
            400,
            description === undefined
                ? "Project description is required"
                : "Project description is too short"
        )
    }

    if (techStack !== undefined && !isValidStringArray(techStack)) {
        throw new ApiError(400, "Tech stack must be a valid string array")
    }

    if (rolesNeeded !== undefined && !isValidRolesNeeded(rolesNeeded)) {
        throw new ApiError(400, "Invalid roles needed")
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
        rolesNeeded,
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
    const { title, description, techStack, projectType, repoLink, status, rolesNeeded } = req.body;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }
    if (title !== undefined && !isValidProjectTitle(title)) {
        throw new ApiError(400, "Invalid title");
    }

    if (description !== undefined && !isValidProjectDescription(description)) {
        throw new ApiError(
            400,
            description === undefined
                ? "Project description is required"
                : "Project description is too short"
        );
    }

    if (techStack !== undefined && !isValidStringArray(techStack)) {
        throw new ApiError(400, "Tech stack must be a valid string array");
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
    const { projectId } = req.params
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }

    let deletedRequestsCount = 0;
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            deletedRequestsCount = await deleteProjectAndRequests(
                projectId,
                req.user._id,
                session
            );
        });
    } catch (error) {
        if (error instanceof ApiError || error.statusCode) {
            throw error;
        }

        if (!isTransactionUnsupportedError(error)) {
            throw error;
        }

        deletedRequestsCount = await deleteProjectAndRequests(
            projectId,
            req.user._id
        );
    } finally {
        await session.endSession();
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        { deletedRequestsCount },
        "Project deleted successfully"
    ))
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
    
    // needs pagination
    // needs searching
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search?.trim() || ""
    const escapeRegex = (text) =>
        text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")       // escape special characters for regex
    const safeSearch = escapeRegex(search)
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "Invalid user id")
    }
    const query = { createdBy: userId }
    if(safeSearch !== ""){
        query.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { description: { $regex: safeSearch, $options: "i" } },
            { techStack: { $elemMatch: { $regex: safeSearch, $options: "i" } } },           // search in tech stack array
            { rolesNeeded: { $elemMatch: { $regex: safeSearch, $options: "i" } } },         // search in roles needed array
        ]
    }
    const allProjects = await Project.find(query).populate("createdBy",
        "fullName userName email"
    ).sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);

    return res
    .status(200)
    .json(new ApiResponse(200, {
        allProjects,
        pagination: {
            page,
            limit,
            totalProjects,
            totalPages,
        }
    }
    , "Projects fetched successfully"))
})

const getExploreProjects = AsyncHandler( async(req, res) => {
    // 1. this is to show others projects to current user to apply in
    // 2. get userId from req.user
    // 3. get all the projects rather than the current user projects
    // 4. return the response

    // needs pagination
    // needs searching
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search?.trim() || ""
    const status = req.query.status?.trim() || "open"       // by default show open projects only
    const escapeRegex = (text) =>
        text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")       // escape special characters for regex
    const safeSearch = escapeRegex(search)
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "User id is invalid")
    }
    const query = {
        createdBy: { $ne: userId },
        status: status
    }
    if (search !== "") {
        query.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { description: { $regex: safeSearch, $options: "i" } },
            { techStack: { $elemMatch: { $regex: safeSearch, $options: "i" } } },           // search in tech stack array
            { rolesNeeded: { $elemMatch: { $regex: safeSearch, $options: "i" } } },         // search in roles needed array
        ];
    }
    const projects = await Project.find(query)
    .populate("createdBy", "fullName userName email").sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    
    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);

    return res
    .status(200)
    .json(new ApiResponse(200, {
        projects,
        pagination: {
            page,
            limit,
            totalProjects,
            totalPages,
        }
    }, "Projects fetched successfully"))
})

export { createProject, updateProject, deleteProject, getProjectById, getMyProjects, getExploreProjects }

// createproject
// updateProject
// deleteProject
// getProjectById
// getMyProjects
// getExploreProjects

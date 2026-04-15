import { Request } from "../models/request.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Project } from "../models/project.model.js";

const createRequest = AsyncHandler(async (req, res) => {
    const requestedBy = req.user._id;
    const { projectId } = req.params;
    const { roleRequested, pitchMessage } = req.body;

    if (!projectId) {
        throw new ApiError(400, "Project id is required");
    }

    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
        throw new ApiError(404, "Project not found");
    }

    if (projectExists.createdBy.toString() === requestedBy.toString()) {
        throw new ApiError(400, "You cannot send request to your own project");
    }

    const duplicateReq = await Request.findOne({
        requestedBy,
        project: projectId
    });

    if (duplicateReq) {
        throw new ApiError(400, "You have already sent request to this project");
    }

    const request = await Request.create({
        requestedBy,
        project: projectId,
        roleRequested,
        pitchMessage
    });

    const populatedRequest = await Request.findById(request._id)
        .populate("requestedBy", "fullName userName email")
        .populate("project", "title description techStack techRoles projectType status");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedRequest, "Request created successfully"));
});

const getRequestsForMyProject = AsyncHandler(async (req, res) => {
    const { projectId } = req.params
    if (!projectId) {
        throw new ApiError(400, "Project id is required")
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id")
    }
    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    if (project.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to view requests for this project")
    }
    const requests = await Request.find({ project: projectId })
    .populate("requestedBy", "fullName userName email")
    .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, requests, "Requests fetched successfully"))
})

const getMySentRequests = AsyncHandler( async(req, res) => {
    const userId = req.user?._id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User id")
    }
    const requests = await Request.find({ requestedBy: userId })
    .populate("project", "title description status")
    .sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests fetched successfully"))
})


export { createRequest, getRequestsForMyProject, getMySentRequests }

// createRequest                :done
// getRequestsForMyProject      :done
// getMySentRequests            :done
// updateRequestStatus
// deleteRequest
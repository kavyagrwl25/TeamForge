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



export { createRequest }

// createRequest                :done
// getRequestsForMyProject      :
// getMySentRequests
// updateRequestStatus
// deleteRequest
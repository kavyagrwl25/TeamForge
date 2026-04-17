import { Request } from "../models/request.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Project } from "../models/project.model.js";
import { isValidRequestStatus } from "../utils/requestValidators.js";
import mongoose from "mongoose";

const createRequest = AsyncHandler(async (req, res) => {
    const requestedBy = req.user._id;
    const { projectId } = req.params;
    const { roleRequested, pitchMessage } = req.body;

    if (typeof roleRequested !== "string" || !roleRequested.trim()) {
        throw new ApiError(400, "Role requested is required")
    }
    if (pitchMessage !== undefined && typeof pitchMessage !== "string") {
        throw new ApiError(400, "Pitch message must be a string")
    }

    if (!projectId) {
        throw new ApiError(400, "Project id is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
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
    const requests = await Request.find({ requestedBy: userId })
    .populate("project", "title description status")
    .sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, requests, "Requests fetched successfully"))
})

const updateRequestStatus = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { requestId } = req.params;
    const { status } = req.body;

    if (!isValidRequestStatus(status)) {
        throw new ApiError(400, "Invalid request status");
    }
    if (status.trim().toLowerCase() === "pending") {
        throw new ApiError(400, "Request cannot be updated back to pending");
    }
    if (!requestId) {
        throw new ApiError(400, "Request id is required");
    }
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, "Invalid request id");
    }
    const request = await Request.findById(requestId).populate("project");

    if (!request) {
        throw new ApiError(404, "Request not found");
    }
    if (request.project.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not allowed to update this request");
    }
    if (request.status !== "pending") {
        throw new ApiError(400, "Only pending requests can be updated");
    }
    
    request.status = status.trim().toLowerCase();
    await request.save();

    const updatedRequest = await Request.findById(request._id)
        .populate("requestedBy", "fullName userName email")
        .populate("project", "title description techStack techRoles projectType status");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRequest, "Request status updated successfully"));
})

const deleteRequest = AsyncHandler( async(req, res) => {
    // get the request id from req.params
    // validate requestId
    // check if request exists or not
    // delete if exists
    const { requestId } = req.params
    if(!requestId){
        throw new ApiError(400, "Request Id needed")
    }
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, "Invalid request id");
    }
    const request = await Request.findById( requestId )
    if(!request){
        throw new ApiError(404, "Request not found")
    }
    if (request.requestedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this request");
    }
    if (request.status === "accepted") {
        throw new ApiError(400, "Accepted requests cannot be deleted");
    }
    await Request.findByIdAndDelete( requestId )

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Request deleted successfully"))
})



export { createRequest, getRequestsForMyProject, getMySentRequests, updateRequestStatus, deleteRequest }

// createRequest                :done
// getRequestsForMyProject      :done
// getMySentRequests            :done
// updateRequestStatus          :done
// deleteRequest                :done
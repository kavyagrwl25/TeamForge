import { API } from "./authServices";

export const createJoinRequest = async (projectId, requestData) => {
  const response = await API.post(`/requests/project/${projectId}`, requestData);
  return response.data;
};

export const getMySentRequests = async () => {
  const response = await API.get("/requests/me");
  return response.data;
};

export const getRequestsForProject = async (projectId) => {
  const response = await API.get(`/requests/project/${projectId}`);
  return response.data;
};

export const updateRequestStatus = async (requestId, statusData) => {
  const response = await API.patch(`/requests/${requestId}`, statusData);
  return response.data;
};

export const deleteRequest = async (requestId) => {
  const response = await API.delete(`/requests/${requestId}`);
  return response.data;
};

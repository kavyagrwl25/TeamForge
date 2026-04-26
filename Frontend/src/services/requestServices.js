import { API } from "./authServices";

export const createJoinRequest = async (projectId, requestData) => {
  const response = await API.post(`/requests/project/${projectId}`, requestData);
  return response.data;
};

export const getMySentRequests = async (page) => {
  // API call for My Requests: GET /api/v1/requests/me?page=${page}&limit=10
  const currentPage = page ?? 1;
  const response = await API.get(`/requests/me?page=${currentPage}&limit=10`);

  if (page === undefined) {
    const requestList = Array.isArray(response.data?.data?.liveRequests)
      ? response.data.data.liveRequests
      : Array.isArray(response.data?.data?.requests)
        ? response.data.data.requests
        : [];

    return {
      ...response,
      data: requestList,
    };
  }

  return response;
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

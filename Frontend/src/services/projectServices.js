import { API } from "./authServices";

export const createProject = async (projectData) => {
  const response = await API.post("/projects", projectData);
  return response.data;
};

export const getMyProjects = async ({
  page = 1,
  limit = 5,
  search = "",
} = {}) => {
  // API call for My Projects: GET /api/v1/projects/me
  const response = await API.get("/projects/me", {
    params: { page, limit, search },
  });
  return response.data;
};

export const getExploreProjects = async ({
  page = 1,
  limit = 5,
  search = "",
  status = "",
} = {}) => {
  // API call for Explore Projects: GET /api/v1/projects
  const response = await API.get("/projects", {
    params: { page, limit, search, status },
  });
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await API.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await API.patch(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await API.delete(`/projects/${projectId}`);
  return response.data;
};

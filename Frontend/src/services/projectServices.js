import { API } from "./authServices";

export const createProject = async (projectData) => {
  const response = await API.post("/projects", projectData);
  return response.data;
};

export const getMyProjects = async () => {
  // API call for My Projects: GET /api/v1/projects/me
  const response = await API.get("/projects/me");
  return response.data;
};

export const getExploreProjects = async () => {
  // API call for Explore Projects: GET /api/v1/projects
  const response = await API.get("/projects");
  return response.data;
};

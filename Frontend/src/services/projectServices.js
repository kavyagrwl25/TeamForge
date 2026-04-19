import { API } from "./authServices";

export const createProject = async (projectData) => {
  const response = await API.post("/projects", projectData);
  return response.data;
};

export const getMyProjects = async () => {
  const response = await API.get("/projects/me");
  return response.data;
};

export const getExploreProjects = async () => {
  const response = await API.get("/projects");
  return response.data;
};

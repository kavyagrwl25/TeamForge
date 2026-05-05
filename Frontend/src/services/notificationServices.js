import { API } from "./authServices";

export const getNotifications = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await API.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.patch("/notifications/read-all");
  return response.data;
};

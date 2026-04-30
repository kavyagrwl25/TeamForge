let io;

const userSocketMap = new Map(); // Map to store userId to socketId mapping for targeted notifications

export const initSocket = (socketServer) => {  
  io = socketServer;
};

export const addUserSocket = (userId, socketId) => { // Store the mapping of userId to socketId when a user connects
  userSocketMap.set(userId.toString(), socketId);
};

export const removeUserSocket = (userId) => {       // Remove the mapping of userId to socketId when a user disconnects
  userSocketMap.delete(userId.toString());
};

export const getUserSocket = (userId) => {          // Get the socketId for a given userId to send targeted notifications
  return userSocketMap.get(userId.toString());
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
let io;

export const initIO = (socketIoInstance) => {
  io = socketIoInstance;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

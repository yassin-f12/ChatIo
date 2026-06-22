import { getSocket } from './socket';

export const updateProfile = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    return;
  }

  if (off) {
    socket.off('updateProfile', payload);
  } else if (typeof payload == 'function') {
    socket.on('updateProfile', payload);
  } else {
    socket.emit('updateProfile', payload);
  }
};

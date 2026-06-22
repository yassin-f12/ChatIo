import { Socket, Server as SocketIOServer } from "socket.io";
import User from "../modals/User.js";
import { generateToken } from "../utils/token.js";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Refuser.",
        });
      }

      try {
        const updateUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true },
        );

        if (!updateUser) {
          return socket.emit("updateProfile", {
            success: false,
            msg: "Utilisateur introuvable.",
          });
        }

        const newToken = generateToken(updateUser);

        socket.emit("updateProfile", {
          success: true,
          data: { token: newToken },
          msg: "Le profil a été mis à jour avec succès !",
        });

      } catch (error) {
        socket.emit("updateProfile", {
          success: false,
          msg: "Erreur lors de la mise à jour du profil.",
        });
      }
    },
  );
}

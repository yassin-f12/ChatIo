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
          msg: "Non autorisé.",
        });
      }

      try {
        const updateUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { returnDocument: "after" },
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

  socket.on("getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;
      if (!currentUserId) {
        socket.emit("getContacts", {
          success: false,
          msg: "Non autorisé.",
        });
        return;
      }

      const users = await User.find(
        { _id: { $ne: currentUserId } }, // mongo connais $ne, regarde en bas du fichier
        { password: 0 }, // exclu les mdp, en gros ne les récupères pas, sécurité
      ).lean();

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));

      socket.emit("getContacts", {
        success: true,
        data: contacts,
      });
    } catch (error: unknown) {
      socket.emit("getContacts", {
        success: false,
        msg: "Erreur lors de la récupérations des contacts.",
      });
    }
  });
}

// attention , a l'avenir, ne pas mettre le meme nom pour les event on et emit

// | Opérateur | Signification      |
// | --------- | ------------------ |
// | `$ne`     | différent de       |
// | `$eq`     | égal               |
// | `$gt`     | plus grand que     |
// | `$lt`     | plus petit que     |
// | `$in`     | dans une liste     |
// | `$nin`    | pas dans une liste |

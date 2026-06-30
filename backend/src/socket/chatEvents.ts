import { Socket, Server as SocketIOServer } from "socket.io";
import Conversation from "../modals/Conversation.js";

export function registerChatEvents(io: SocketIOServer, socket: Socket) {
  socket.on("getConversations", async () => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("getConversations", {
          success: false,
          msg: "Non autorisé.",
        });
        return;
      }

      const conversations = await Conversation.find({
        participants: userId,
      })
        .sort({ updateAt: -1 })
        .populate({
          path: "lastMessage",
          select: "content senderId attachement createdAt",
        })
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      socket.emit("getConversations", {
        success: true,
        data: conversations,
      });
    } catch (error: unknown) {
      socket.emit("getConversations", {
        success: false,
        msg: "Erreur lors de la récupérations des conversations.",
      });
    }
  });

  socket.on("newConversation", async (data) => {
    try {
      if (data.type == "direct") {
        const existingConversations = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
          .populate({
            path: "participants",
            select: "name avatar email",
          })
          .lean();

        if (existingConversations) {
          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversations, isNew: false },
          });

          return;
        }
      }

      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "", // peut etre vide si c un chat direct
        avatar: data.avatar || "", // meme chose
        createdBy: socket.data.userId,
      });

      const connectedSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId),
      );

      connectedSockets.forEach((participantSocket) => {
        participantSocket.join(conversation._id.toString());
      });

      const populatedConversation = await Conversation.findById(
        conversation._id,
      )
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      if (!populatedConversation) {
        throw new Error("Erreur lors du remplissage de cette conversation");
      }

      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
      });
    } catch (error: unknown) {
      socket.emit("newConversation", {
        success: false,
        msg: "Erreur lors de la création de conversation.",
      });
    }
  });
}

// | Opérateur | Signification              |
// | --------- | -------------------------- |
// | `$in`     | dans une liste             |
// | `$nin`    | pas dans une liste         |
// | `$all`    | contient tous les éléments |
// | `$size`   | taille exacte du tableau   |

// | Opérateur | Signification              |
// | --------- | -------------------------- |
// | `$in`     | dans une liste             |
// | `$nin`    | pas dans une liste         |
// | `$all`    | contient tous les éléments |
// | `$size`   | taille exacte du tableau   |

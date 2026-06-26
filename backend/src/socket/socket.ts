import dotenv from "dotenv";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { AuthTokenPayload, SocketData } from "../types.js";
import { registerUserEvents } from "./userEvents.js";
import { registerChatEvents } from "./chatEvents.js";
import Conversation from "../modals/Conversation.js";

dotenv.config();

type DefaultEvents = Record<string, (...args: any[]) => void>;

type AppSocket = Socket<
  DefaultEvents,
  DefaultEvents,
  DefaultEvents,
  SocketData
>;
type AppServer = SocketIOServer<
  DefaultEvents,
  DefaultEvents,
  DefaultEvents,
  SocketData
>;

export function initializeSocket(server: HTTPServer): AppServer {
  const io: AppServer = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket: AppSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Erreur d'authentification: aucun token"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || !decoded || typeof decoded === "string") {
          return next(new Error("Erreur d'authentification: token invalid"));
        }

        const payload = decoded as AuthTokenPayload;
        socket.data = {
          user: payload.user,
          userId: payload.user.id,
        };
        next();
      },
    );
  });

  io.on("connection", async (socket: AppSocket) => {
    const userId = socket.data.userId;
    console.log(
      `Utilisateur connecté : ${userId}, name: ${socket.data.user?.name} `,
    );

    registerUserEvents(io, socket);
    registerChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("Utilisateur déconnecté :", userId);
    });

    if (!userId) return;

    try {
      const conversations = await Conversation.find({
        participants: userId,
      }).select("_id");

      const rooms = conversations.map((c) => c._id.toString());
      socket.join(rooms);
      
    } catch (error: unknown) {
      console.log("Erreur lors du rejoins :", error);
    }
  });

  return io;
}

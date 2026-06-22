import type { JwtPayload } from "jsonwebtoken";
import { Document, Types } from "mongoose";

export interface UserProps extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  created?: Date;
}

export interface ConversationProps extends Document {
  _id: Types.ObjectId;
  type: "direct" | "group";
  name?: string;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  user: JwtUser;
}

export interface SocketData {
  userId: string;
  user: JwtUser;
}

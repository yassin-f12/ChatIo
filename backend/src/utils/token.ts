import jwt from "jsonwebtoken";
import type { UserProps } from "../types.js";

export const generateToken = (user: UserProps) => {
  const payload = {
    sub: user._id.toString(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "3d",
  });
};

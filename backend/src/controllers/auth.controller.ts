import type { Request, Response } from "express";
import User from "../modals/User.js";
import argon2 from "argon2";
import { generateToken } from "../utils/token.js";

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password, name, avatar } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, msg: "User already exists" });
      return;
    }

    user = new User({
      email,
      password,
      name,
      avatar: avatar || "",
    });

    user.password = await argon2.hash(password);

    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

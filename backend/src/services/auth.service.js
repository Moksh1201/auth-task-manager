import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashed = await hashPassword(password);
  let user;
  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: role || "USER",
    });
  } catch (err) {
    if (err?.code === 11000) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  const token = signToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

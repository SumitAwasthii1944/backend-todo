import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const jwtsecret = process.env.JWT_SECRET;

const userMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = new mongoose.Types.ObjectId(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export {userMiddleware};

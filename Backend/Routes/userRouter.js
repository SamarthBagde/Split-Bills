import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  login,
  updateUser,
} from "../Controllers/userController.js";
import { protect } from "../Controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", login);
userRouter.get("/", protect, getUsers);
userRouter.delete("/:useerId", protect, deleteUser);
userRouter.patch("/:useerId", protect, updateUser);

export default userRouter;

import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getUsers);
userRouter.delete("/:id", deleteUser);
userRouter.patch("/:id", updateUser);

export default userRouter;

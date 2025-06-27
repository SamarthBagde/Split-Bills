import express from "express";
import {
  addUserToGroup,
  createGroup,
  deleteGroup,
  getExpensesOfGroup,
  getGroups,
  getMemebersOfGroup,
  settleUp,
} from "../Controllers/groupController.js";
import { protect } from "../Controllers/authController.js";

const groupRouter = express.Router();

groupRouter.post("/", protect, createGroup);
groupRouter.get("/", protect, getGroups);
groupRouter.post("/:groupId", protect, addUserToGroup);
groupRouter.delete("/:groupId", protect, deleteGroup);
groupRouter.get("/:groupId/members", protect, getMemebersOfGroup);
groupRouter.get("/:groupId/expenses", protect, getExpensesOfGroup);
groupRouter.get("/:groupId/settel-up", protect, settleUp);

export default groupRouter;

import express from "express";
import {
  addUserToGroup,
  createGroup,
  deleteGroup,
  getExpensesOfGroup,
  getGroups,
  getMemebersOfGroup,
  settleUp,
  updaetGroupDetails,
} from "../Controllers/groupController.js";
import { protect } from "../Controllers/authController.js";
import groupMembers from "../Model/groupMembers.js";

const groupRouter = express.Router();

groupRouter.post("/", protect, createGroup);
groupRouter.get("/", protect, getGroups);
groupRouter.post("/:groupId", protect, addUserToGroup);
groupRouter.patch("/:groupId", protect, updaetGroupDetails);
groupRouter.delete("/:groupId", protect, deleteGroup);
groupRouter.get("/:groupId/members", protect, getMemebersOfGroup);
groupRouter.get("/:groupId/expenses", protect, getExpensesOfGroup);
groupRouter.get("/:groupId/settel-up", protect, settleUp);

export default groupRouter;

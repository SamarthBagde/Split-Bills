import express from "express";
import {
  addUserToGroup,
  createGroup,
  deleteGroup,
  getExpensesOfGroup,
  getGroups,
  getMemebersOfGroup,
} from "../Controllers/groupController.js";
import { protect } from "../Controllers/authController.js";

const groupRouter = express.Router();

groupRouter.post("/", protect, createGroup);
groupRouter.get("/", protect, getGroups);
groupRouter.post("/:group_id", protect, addUserToGroup);
groupRouter.delete("/:group_id", protect, deleteGroup);
groupRouter.get("/:group_id/members", protect, getMemebersOfGroup);
groupRouter.get("/:group_id/expenses", protect, getExpensesOfGroup);

export default groupRouter;

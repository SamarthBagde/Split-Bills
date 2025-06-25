import express from "express";
import {
  addUserToGroup,
  createGroup,
  getExpensesOfGroup,
  getGroups,
  getMemebersOfGroup,
} from "../Controllers/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/", createGroup);
groupRouter.get("/", getGroups);
groupRouter.post("/:group_id", addUserToGroup);
groupRouter.get("/:group_id/members", getMemebersOfGroup);
groupRouter.get("/:group_id/expenses", getExpensesOfGroup);

export default groupRouter;

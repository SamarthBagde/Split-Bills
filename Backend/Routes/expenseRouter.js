import express from "express";
import {
  addExpense,
  deleteExpense,
  expSplit,
  getExpense,
  getExpenses,
  updateExpense,
} from "../Controllers/expenseController.js";
import { protect } from "../Controllers/authController.js";

const expenseRouter = express.Router();

expenseRouter.post("/", protect, addExpense);
expenseRouter.get("/", protect, getExpenses);
expenseRouter.get("/:expenseId", protect, getExpense);
expenseRouter.get("/:expenseId/split", protect, expSplit);
expenseRouter.patch("/:expenseId", protect, updateExpense);
expenseRouter.delete("/:expenseId", protect, deleteExpense);

export default expenseRouter;

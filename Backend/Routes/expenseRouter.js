import express from "express";
import {
  addExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "../Controllers/expenseController.js";
import { protect } from "../Controllers/authController.js";

const expenseRouter = express.Router();

expenseRouter.post("/", protect, addExpense);
expenseRouter.get("/", protect, getExpenses);
expenseRouter.get("/:expense_id", protect, getExpense);
expenseRouter.patch("/:expense_id", protect, updateExpense);
expenseRouter.delete("/:expense_id", protect, deleteExpense);

export default expenseRouter;

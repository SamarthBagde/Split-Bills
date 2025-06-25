import express from "express";
import {
  addExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "../Controllers/expenseController.js";

const expenseRouter = express.Router();

expenseRouter.post("/", addExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.get("/:expense_id", getExpense);
expenseRouter.patch("/:expense_id", updateExpense);
expenseRouter.delete("/:expense_id", deleteExpense);

export default expenseRouter;

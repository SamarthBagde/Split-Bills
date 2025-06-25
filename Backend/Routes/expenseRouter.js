import express from "express";
import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../Controllers/expenseController.js";

const expenseRouter = express.Router();

expenseRouter.post("/", addExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.patch("/:expense_id", updateExpense);
expenseRouter.delete("/:expense_id", deleteExpense);

export default expenseRouter;

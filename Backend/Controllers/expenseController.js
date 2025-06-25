import { asyncHandler } from "../Middlerwares/asyncHandler.js";
import { AppError } from "../Utils/appError.js";
import { expenses, groups, users } from "../Model/index.js";

export const addExpense = asyncHandler(async (req, res, next) => {
  const { title, amount, paid_by, group_id } = req.body || {};

  if (!title || !amount || !paid_by || !group_id) {
    return next(new AppError("Please provide all field", 400));
  }

  const user = await users.findByPk(paid_by); // payer
  const group = await groups.findByPk(group_id);

  if (!user) {
    return next(new AppError("No user found with provided ID", 400));
  }

  if (!group) {
    return next(new AppError("No group found with provided ID", 400));
  }

  const expense = await expenses.create({ title, amount, paid_by, group_id });

  res.status(200).json({
    status: "success",
    data: {
      expense,
    },
  });
});

export const getExpenses = asyncHandler(async (req, res, next) => {
  const expensesData = await expenses.findAll();

  res.status(200).json({
    status: "success",
    total: expensesData.length,
    data: {
      expensesData,
    },
  });
});

export const updateExpense = asyncHandler(async (req, res, next) => {
  const { title, amount } = req.body || {};
  const { expense_id } = req.params;

  if (!title && !amount) {
    return next(new AppError("Please provide at least one field", 400));
  }

  const expense = await expenses.findByPk(expense_id);

  if (!expense) {
    return next(new AppError("No expense found with provided ID", 400));
  }

  if (title) expense.title = title;
  if (amount) expense.amount = amount;

  const updatedExpense = await expense.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedExpense,
    },
  });
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { expense_id } = req.params;

  const expense = await expenses.findByPk(expense_id);

  if (!expense) {
    return next(new AppError("No expense found with provided ID", 400));
  }

  await expenses.destroy({ where: { expense_id } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

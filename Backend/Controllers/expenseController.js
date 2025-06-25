import { asyncHandler } from "../Middlerwares/asyncHandler.js";
import { AppError } from "../Utils/appError.js";
import {
  expenses,
  expenseSplit,
  groupMembers,
  groups,
  users,
} from "../Model/index.js";
import { Op } from "sequelize";
import sequelize from "../DB/dbcConnection.js";

export const addExpense = asyncHandler(async (req, res, next) => {
  const { title, amount, paid_by, group_id } = req.body || {};

  if (!title || !amount || !paid_by || !group_id) {
    return next(new AppError("Please provide all field", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    const user = await users.findByPk(paid_by, { transaction }); // payer
    const group = await groups.findByPk(group_id, { transaction });

    if (!user) {
      await transaction.rollback();
      return next(new AppError("No user found with provided ID", 400));
    }

    if (!group) {
      await transaction.rollback();
      return next(new AppError("No group found with provided ID", 400));
    }

    const expense = await expenses.create(
      { title, amount, paid_by, group_id },
      { transaction }
    );

    const members = await groupMembers.findAll({
      where: { group_id },
      transaction,
    });
    const membersIds = members.map((m) => m.user_id);

    if (!membersIds.includes(paid_by)) {
      await transaction.rollback();
      return next(new AppError("Payer must be a member of the group", 400));
    }

    const perPersonAmount = parseFloat((amount / membersIds.length).toFixed(2));

    const split = membersIds
      .filter((user_id) => user_id !== paid_by)
      .map((user_id) => ({
        expense_id: expense.expense_id,
        user_id: parseInt(user_id),
        paid_to: parseInt(paid_by),
        amount: perPersonAmount,
      }));

    await expenseSplit.bulkCreate(split, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        expense,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(new AppError("Failed to add expense", 500));
  }
});

export const getExpenses = asyncHandler(async (req, res, next) => {
  //can filter expenses by group id, paid by, min and max amount
  const {
    group_id,
    paid_by,
    min_amount,
    max_amount,
    sort_by,
    order = "ASC",
  } = req.query;

  const whereClause = {};

  if (group_id) whereClause.group_id = group_id;
  if (paid_by) whereClause.paid_by = paid_by;

  if (min_amount || max_amount) {
    whereClause.amount = {};
    if (min_amount) whereClause.amount[Op.gte] = parseFloat(min_amount);
    if (max_amount) whereClause.amount[Op.lte] = parseFloat(max_amount);
  }

  const queryObject = { where: whereClause };

  if (sort_by && order) {
    queryObject.order = [[sort_by, order.toUpperCase()]];
  }

  const expensesData = await expenses.findAll(queryObject);

  res.status(200).json({
    status: "success",
    total: expensesData.length,
    data: {
      expensesData,
    },
  });
});

export const getExpense = asyncHandler(async (req, res, next) => {
  const { expense_id } = req.params;

  const expense = await expenses.findByPk(expense_id);

  if (!expense) {
    return next(new AppError("No expense found with provided ID", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      expense,
    },
  });
});

export const updateExpense = asyncHandler(async (req, res, next) => {
  const { title, amount } = req.body || {};
  const { expense_id } = req.params;

  if (!title && !amount) {
    return next(new AppError("Please provide at least one field", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    const expense = await expenses.findByPk(expense_id, { transaction });

    if (!expense) {
      return next(new AppError("No expense found with provided ID", 400));
    }

    if (title) expense.title = title;
    if (amount) expense.amount = amount;

    const updatedExpense = await expense.save({ transaction });
    if (amount) {
      const group_id = expense.group_id;
      const paid_by = expense.paid_by;

      const members = await groupMembers.findAll({
        where: { group_id },
        transaction,
      });
      const membersIds = members.map((m) => m.user_id);

      if (!membersIds.includes(paid_by)) {
        await transaction.rollback();
        return next(new AppError("Payer must be a member of the group", 400));
      }

      const perPersonAmount = parseFloat(
        (amount / membersIds.length).toFixed(2)
      );

      await expenseSplit.destroy({ where: { expense_id }, transaction });

      const split = membersIds
        .filter((user_id) => user_id !== paid_by)
        .map((user_id) => ({
          expense_id: expense_id,
          user_id: user_id,
          paid_to: paid_by,
          amount: perPersonAmount,
        }));

      await expenseSplit.bulkCreate(split, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        updatedExpense,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating expense:", error.message);
    return next(new AppError("Failed to update expense", 500));
  }
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { expense_id } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const expense = await expenses.findByPk(expense_id, { transaction });

    if (!expense) {
      await transaction.rollback();
      return next(new AppError("No expense found with provided ID", 400));
    }

    await expenseSplit.destroy({ where: { expense_id }, transaction });

    await expenses.destroy({ where: { expense_id }, transaction });

    await transaction.commit();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    console.log("Error deleting expense : ", error.message);
    return next(new AppError("Failed to delete expense", 500));
  }
});

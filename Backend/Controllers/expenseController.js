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
  const { title, amount, paidBy, groupId } = req.body || {};

  if (!title || !amount || !paidBy || !groupId) {
    return next(new AppError("Please provide all field", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    const user = await users.findByPk(paidBy, { transaction }); // payer
    const group = await groups.findByPk(groupId, { transaction });

    if (!user) {
      await transaction.rollback();
      return next(new AppError("No user found with provided ID", 404));
    }

    if (!group) {
      await transaction.rollback();
      return next(new AppError("No group found with provided ID", 404));
    }

    const expense = await expenses.create(
      { title, amount, paidBy, groupId },
      { transaction }
    );

    const members = await groupMembers.findAll({
      where: { groupId },
      transaction,
    });
    const membersIds = members.map((m) => m.userId);

    if (!membersIds.includes(paidBy)) {
      await transaction.rollback();
      return next(new AppError("Payer must be a member of the group", 400));
    }

    const perPersonAmount = parseFloat((amount / membersIds.length).toFixed(2));

    const rem = parseFloat(
      (amount - perPersonAmount * membersIds.length).toFixed(2)
    );
    let remPaisa = Math.round(rem * 100);

    const split = membersIds.map((userId) => {
      let extra = 0;

      if (remPaisa > 0) {
        extra = 0.1;
        remPaisa--;
      }

      return {
        expenseId: expense.expenseId,
        userId: parseInt(userId),
        paidTo: parseInt(paidBy),
        amount: parseFloat((perPersonAmount + extra).toFixed(2)),
      };
    });

    await expenseSplit.bulkCreate(split, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        expense,
      },
    });
  } catch (error) {
    await transaction.rollback(); // here you need to use try catch even if you used asyncHandler because you need to rollback if error occure
    return next(error);
  }
});

export const getExpenses = asyncHandler(async (req, res, next) => {
  //can filter expenses by group id, paid by, min and max amount
  const {
    groupId,
    paidBy,
    minAmount,
    maxAmount,
    sortBy,
    order = "ASC",
  } = req.query;

  const whereClause = {};

  if (groupId) whereClause.groupId = groupId;
  if (paidBy) whereClause.paidBy = paidBy;

  if (minAmount || maxAmount) {
    whereClause.amount = {};
    if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
    if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
  }

  const queryObject = { where: whereClause };

  if (sortBy && order) {
    queryObject.order = [[sortBy, order.toUpperCase()]];
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
  const { expenseId } = req.params;

  const expense = await expenses.findByPk(expenseId);

  if (!expense) {
    return next(new AppError("No expense found with provided ID", 404));
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
  const { expenseId } = req.params;

  if (!title && !amount) {
    return next(new AppError("Please provide at least one field", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    const expense = await expenses.findByPk(expenseId, { transaction });

    if (!expense) {
      return next(new AppError("No expense found with provided ID", 404));
    }

    if (title) expense.title = title;
    if (amount) expense.amount = amount;

    const updatedExpense = await expense.save({ transaction });
    if (amount) {
      const groupId = expense.groupId;
      const paidBy = expense.paidBy;

      const members = await groupMembers.findAll({
        where: { groupId },
        transaction,
      });
      const membersIds = members.map((m) => m.userId);

      if (!membersIds.includes(paidBy)) {
        await transaction.rollback();
        return next(new AppError("Payer must be a member of the group", 400));
      }

      const perPersonAmount = parseFloat(
        (amount / membersIds.length).toFixed(2)
      );

      await expenseSplit.destroy({ where: { expenseId }, transaction });

      const split = membersIds
        .filter((userId) => userId !== paidBy)
        .map((userId) => ({
          expenseId: expenseId,
          userId: userId,
          paidTo: paidBy,
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
    return next(error);
  }
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { expenseId } = req.params;
  const user = req.user;

  const transaction = await sequelize.transaction();

  try {
    const expense = await expenses.findByPk(expenseId, { transaction });

    if (!expense) {
      await transaction.rollback();
      return next(new AppError("No expense found with provided ID", 404));
    }

    if (user.userId !== expense.paidBy) {
      await transaction.rollback();
      return next(
        new AppError(
          "You are not authorized to delete this expense as you are not the payer",
          403
        )
      );
    }

    await expenseSplit.destroy({ where: { expenseId }, transaction });

    await expenses.destroy({ where: { expenseId }, transaction });

    await transaction.commit();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    console.log("Error deleting expense : ", error.message);
    return next(error);
  }
});

export const expSplit = asyncHandler(async (req, res, next) => {
  const { expenseId } = req.params;

  // Validate expense ID format
  if (!expenseId) {
    return next(new AppError("Invalid expense ID format", 400));
  }

  // Fetch the expense
  const expense = await expenses.findByPk(expenseId);
  if (!expense) {
    return next(new AppError("No expense found with the provided ID", 404));
  }

  // Fetch associated splits
  const splitDetails = await expenseSplit.findAll({
    where: { expenseId },
    attributes: { exclude: ["expenseSplitId", "expenseId"] },
  });

  res.status(200).json({
    status: "success",
    data: {
      expense: {
        title: expense.title,
        amount: expense.amount,
        paidBy: expense.paidBy,
      },
      split: splitDetails,
    },
  });
});

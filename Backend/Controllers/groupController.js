import sequelize from "../DB/dbcConnection.js";
import { asyncHandler } from "../Middlerwares/asyncHandler.js";
import {
  groupMembers,
  groups,
  users,
  expenses,
  expenseSplit,
} from "../Model/index.js";
import { AppError } from "../Utils/appError.js";

export const createGroup = asyncHandler(async (req, res, next) => {
  const { name, userId } = req.body;

  if (!name) {
    return next(new AppError("Please provide all field", 400));
  }

  const user = await users.findByPk(userId);

  if (!user) {
    return next(new AppError("No user found with provided ID", 404));
  }

  const group = await groups.create({ name });

  const groupId = group.groupId;

  if (!groupId) {
    return next(
      new AppError("Group id is not found or group is not created", 400)
    );
  }

  const groupMember = await groupMembers.create({
    groupId: groupId,
    userId: userId,
  });

  res.status(200).json({
    status: "success",
    data: {
      group,
    },
  });
});

//in this you can check id user is already in group or not
//currently it giving error if you try to add same user in group
export const addUserToGroup = asyncHandler(async (req, res, next) => {
  const { userId } = req.body || {};
  const { groupId } = req.params;

  if (!userId) {
    return next(new AppError("Please provide user ID", 400));
  }
  if (!groupId) {
    return next(new AppError("Please provide group ID", 400));
  }

  const group = await groups.findByPk(groupId);
  const user = await users.findByPk(userId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  if (!user) {
    return next(new AppError("No user found with provided ID", 404));
  }

  const data = await groupMembers.create({
    groupId: groupId,
    userId: userId,
  });

  res.status(200).json({
    status: "success",
    data: {
      data,
    },
  });
});

export const getGroups = asyncHandler(async (req, res, next) => {
  const groupsData = await groups.findAll();

  res.status(200).json({
    status: "success",
    total: groupsData.length,
    data: {
      groups: groupsData,
    },
  });
});

export const getMemebersOfGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await groups.findByPk(groupId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  const members = await groupMembers.findAll({ where: { groupId } });

  res.status(200).json({
    status: "success",
    total: members.length,
    data: {
      members,
    },
  });
});

export const getExpensesOfGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await groups.findByPk(groupId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  const groupExpenses = await expenses.findAll({ where: { groupId } });

  res.status(200).json({
    status: "success",
    total: groupExpenses.length,
    data: {
      expenses: groupExpenses,
    },
  });
});

export const deleteGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  const user = req.user;

  const transaction = await sequelize.transaction();

  try {
    const group = await groups.findByPk(groupId, { transaction });
    if (!group) {
      await transaction.rollback();
      return next(new AppError("No group found with provided ID", 404));
    }

    const members = await groupMembers.findAll({
      where: { groupId: group.groupId },
      transaction,
    });

    const membersIds = members.map((m) => m.userId);

    if (!membersIds.includes(user.userId)) {
      await transaction.rollback();
      return next(
        new AppError(
          "You are not authorized to delete this group as you are not the member of this group",
          403
        )
      );
    }

    // deleting data related to the group from group member table
    await groupMembers.destroy({ where: { groupId }, transaction });

    const expensesData = await expenses.findAll({
      where: { groupId },
      transaction,
    });
    const expensesIds = expensesData.map((e) => e.expenseId);

    // deleting data related to the group from expense split table
    if (expensesIds.length > 0) {
      await expenseSplit.destroy({
        where: { expenseId: expensesIds },
        transaction,
      });
    }

    //deleting data related to the group from expense table
    await expenses.destroy({ where: { groupId }, transaction });

    //deleting group itself
    await group.destroy({ transaction }); // directly deleteing instance

    await transaction.commit();

    res.status(204).json({
      status: "succes",
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting group:", error.message);
    return next(error);
  }
});

export const settleUp = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await groups.findByPk(groupId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  const groupExpenses = await expenses.findAll({ where: { groupId } });

  const eid = groupExpenses.map((e) => e.expenseId);

  const groupSPlit = await expenseSplit.findAll({ where: { expenseId: eid } });

  res.status(200).json({
    groupSPlit,
  });
});

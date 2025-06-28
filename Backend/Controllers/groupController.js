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

//updated -> you can add multiples useer at a time or single user also
export const addUserToGroup = asyncHandler(async (req, res, next) => {
  let { userIds } = req.body || {};
  const { groupId } = req.params;

  if (!userIds) {
    return next(new AppError("Please provide user ID(s)", 400));
  }
  if (!groupId) {
    return next(new AppError("Please provide group ID", 400));
  }

  if (!Array.isArray(userIds)) {
    userIds = [userIds];
  }

  const group = await groups.findByPk(groupId);
  const usersData = await users.findAll({ where: { userId: userIds } });

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  if (usersData.length !== userIds.length) {
    return next(new AppError("One or more users not found", 404));
  }

  const existingMembers = await groupMembers.findAll({
    where: { groupId, userId: userIds },
  });
  const existingMemberIds = existingMembers.map((em) => em.userId);

  if (existingMemberIds.length > 0) {
    return next(
      new AppError(
        `Users already in group : ${existingMemberIds.join(", ")}`,
        400
      )
    );
  }

  const members = userIds.map((id) => ({
    groupId,
    userId: id,
  }));

  const data = await groupMembers.bulkCreate(members);

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

export const updaetGroupDetails = asyncHandler(async (req, res, next) => {
  const { name } = req.body || {};
  const { groupId } = req.params;
  const user = req.user;

  if (!name.trim()) {
    return naxt(new AppError("Please provide at least one field", 400));
  }

  const group = await groups.findByPk(groupId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  const member = await groupMembers.findOne({
    where: { groupId, userId: user.userId },
  });

  if (!member) {
    return next(
      new AppError(
        "You are not authorized to delete this group as you are not the member of this group",
        403
      )
    );
  }

  if (name.trim()) group.name = name.trim();

  const updatedGroup = await group.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedGroup,
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

    // const members = await groupMembers.findAll({
    //   where: { groupId: group.groupId },
    //   transaction,
    // });

    // const membersIds = members.map((m) => m.userId);

    // if (!membersIds.includes(user.userId)) {
    //   await transaction.rollback();
    //   return next(
    //     new AppError(
    //       "You are not authorized to delete this group as you are not the member of this group",
    //       403
    //     )
    //   );
    // }

    //above code is bit long and might take longer time than below code give better performance and readability

    const members = await groupMembers.findOne({
      where: { groupId: group.groupId, userId: user.userId },
      transaction,
    });

    if (!members) {
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

//this use greedy approch to settelup bills
export const settleUp = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await groups.findByPk(groupId);

  if (!group) {
    return next(new AppError("No group found with provided ID", 404));
  }

  const groupExpenses = await expenses.findAll({ where: { groupId } });

  const eid = groupExpenses.map((e) => e.expenseId);

  const groupSPlit = await expenseSplit.findAll({ where: { expenseId: eid } });

  let balances = {};

  for (const split of groupSPlit) {
    balances[split.userId] = (balances[split.userId] || 0) - split.amount;

    balances[split.paidTo] = (balances[split.paidTo] || 0) + split.amount;
  }

  const debtors = [];
  const creditors = [];

  for (const userId in balances) {
    const balance = parseFloat(balances[userId].toFixed(2));

    if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0) {
      creditors.push({ userId, amount: balance });
    }
  }

  const settelment = [];

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.amount, debtor.amount);

    settelment.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(amount.toFixed(2)),
    });

    //this will change value in orginal object because in js objects and arrays are passed by reference
    //they holds a reference of the same object
    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount === 0) i++;
    if (debtor.amount === 0) j++;
  }

  res.status(200).json({
    status: "success",
    data: {
      settelment,
    },
  });
});

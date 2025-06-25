import { asyncHandler } from "../Middlerwares/asyncHandler.js";
import { groupMembers, groups, users, expenses } from "../Model/index.js";
import { AppError } from "../Utils/appError.js";

export const createGroup = asyncHandler(async (req, res, next) => {
  const { name, user_id } = req.body;

  if (!name) {
    return next(new AppError("Please provide all field", 400));
  }

  const user = await users.findByPk(user_id);

  if (!user) {
    return next(new AppError("No user found with the provided ID", 400));
  }

  const group = await groups.create({ name });

  const group_id = group.group_id;

  if (!group_id) {
    return next(
      new AppError("Group id is not found or group is not created", 400)
    );
  }

  const groupMember = await groupMembers.create({
    group_id: group_id,
    user_id: user_id,
  });

  res.status(200).json({
    status: "success",
    data: {
      group,
    },
  });
});

export const addUserToGroup = asyncHandler(async (req, res, next) => {
  const { user_id } = req.body || {};
  const { group_id } = req.params;

  if (!user_id) {
    return next(new AppError("Please provide user ID", 400));
  }
  if (!group_id) {
    return next(new AppError("Please provide group ID", 400));
  }

  const group = await groups.findByPk(group_id);
  const user = await users.findByPk(user_id);

  if (!group) {
    return next(new AppError("No group found with the provided ID", 400));
  }

  if (!user) {
    return next(new AppError("No user found with the provided ID", 400));
  }

  const data = await groupMembers.create({
    group_id: group_id,
    user_id: user_id,
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
  const { group_id } = req.params;

  const group = await groups.findByPk(group_id);

  if (!group) {
    return next(new AppError("No group found with the provided ID", 400));
  }

  const members = await groupMembers.findAll({ where: { group_id } });

  res.status(200).json({
    status: "success",
    total: members.length,
    data: {
      members,
    },
  });
});

export const getExpensesOfGroup = asyncHandler(async (req, res, next) => {
  const { group_id } = req.params;

  const group = await groups.findByPk(group_id);

  if (!group) {
    return next(new AppError("No group found with the provided ID", 400));
  }

  const groupExpenses = await expenses.findAll({ where: { group_id } });

  res.status(200).json({
    status: "success",
    total: groupExpenses.length,
    data: {
      expenses: groupExpenses,
    },
  });
});

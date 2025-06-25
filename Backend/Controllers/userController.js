import { asyncHandler } from "../Middlerwares/asyncHandler.js";
import { AppError } from "../Utils/appError.js";
import { users } from "../Model/index.js";

export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return next(new AppError("Please enter all fields"), 400);
  }

  const user = await users.create({ name, email });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const usersData = await users.findAll();

  res.status(200).json({
    status: "success",
    total: usersData.length,
    data: {
      users: usersData,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await users.findByPk(id);

  if (!user) {
    return next(new AppError("No user found with the provided ID", 404));
  }

  await users.destroy({ where: { id: id } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email } = req.body || {};

  const user = await users.findByPk(id);

  if (!user) {
    return next(new AppError("No user found with the provided ID", 404));
  }

  if (!name && !email) {
    return next(new AppError("Please provide at least one field", 404));
  }

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

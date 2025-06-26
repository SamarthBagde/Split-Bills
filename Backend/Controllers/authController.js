import jwt from "jsonwebtoken";
import { users } from "../Model/index.js";
import { AppError } from "../Utils/appError.js";
import { asyncHandler } from "../Middlerwares/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const { jwtToken } = req.cookies;

  if (!jwtToken) {
    return next(
      new AppError("You are not logged in please log in to get access", 401)
    );
  }

  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

  const user = await users.findByPk(decode.id);

  if (!user) {
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }

  req.user = user;

  next();
});

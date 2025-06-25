import { AppError } from "../Utils/appError.js";

const sendError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("Error : ", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleSequelizeValidationErrorDB = (err) => {
  const error = Object.create(err.errors).map((e) => e.message);
  const message = `Invalid input data. ${error.join(", ")}`;
  return new AppError(message, 400);
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = err;

  if (error.name === "SequelizeValidationError") {
    error = handleSequelizeValidationErrorDB(error);
  }
  sendError(error, res);
};
